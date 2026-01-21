'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Gift,
  Download,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useHydratedCart } from '@/lib/store';
import { formatPrecio, formatFecha } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { descargarOrdenPDF } from '@/lib/pdf';
import type { Cliente, Promocion, Producto } from '@/lib/types';
import { CODIGOS_DESCUENTO } from '@/lib/types';

interface OrdenAnteriorItem {
  cantidad: number;
  producto: Producto | null;
}

interface OrdenAnterior {
  id: string;
  numero: string;
  total: number;
  created_at: string;
  orden_items: OrdenAnteriorItem[];
}

interface CarritoClientProps {
  cliente: Cliente;
  promociones: Promocion[];
  ordenesAnteriores: OrdenAnterior[];
}

export default function CarritoClient({ cliente, promociones, ordenesAnteriores }: CarritoClientProps) {
  const router = useRouter();
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDescuentoPromocion,
    getTotal,
    codigoDescuento,
    descuentoCodigo,
    setCodigoDescuento,
  } = useHydratedCart();

  // Repetir pedido anterior
  const handleRepetirPedido = (orden: OrdenAnterior) => {
    clearCart();
    orden.orden_items.forEach((item) => {
      if (item.producto) {
        addItem(item.producto, item.cantidad);
      }
    });
  };

  const [codigoInput, setCodigoInput] = useState('');
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [codigoSuccess, setCodigoSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState('');

  const subtotal = getSubtotal();
  const descuentoCodigoMonto = (subtotal * descuentoCodigo) / 100;
  const descuentoPromocionMonto = getDescuentoPromocion(promociones);
  const total = getTotal(promociones);

  // Get applicable promotions descriptions
  const promocionesAplicables = promociones.filter((promo) => {
    if (promo.codigo) return false; // Skip code-based promotions

    if (promo.marca_id) {
      const itemsMarca = items.filter((item) => item.producto.marca_id === promo.marca_id);
      const cajasTotal = itemsMarca.reduce((sum, item) => sum + item.cantidad, 0);
      return cajasTotal >= promo.min_cajas;
    }

    const cajasTotal = items.reduce((sum, item) => sum + item.cantidad, 0);
    const cumpleMinCajas = promo.min_cajas === 0 || cajasTotal >= promo.min_cajas;
    const cumpleMinMonto = promo.min_monto === 0 || subtotal >= promo.min_monto;
    return cumpleMinCajas && cumpleMinMonto;
  });

  const handleAplicarCodigo = () => {
    setCodigoError(null);
    setCodigoSuccess(null);

    const codigo = codigoInput.trim().toUpperCase();
    if (!codigo) {
      setCodigoError('Ingresá un código');
      return;
    }

    const descuentoEncontrado = CODIGOS_DESCUENTO.find((d) => d.codigo === codigo);
    if (!descuentoEncontrado) {
      setCodigoError('Código inválido o expirado');
      return;
    }

    setCodigoDescuento(codigo, descuentoEncontrado.porcentaje);
    setCodigoSuccess(`Código aplicado: ${descuentoEncontrado.descripcion}`);
    setCodigoInput('');
  };

  const handleQuitarCodigo = () => {
    setCodigoDescuento(null, 0);
    setCodigoSuccess(null);
  };

  // Generar número de orden único
  const generarNumeroOrden = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `OC-${año}-${timestamp}${random}`;
  };

  // Generar orden: guarda en DB, descarga PDF y va al historial
  const handleGenerarOrden = async () => {
    if (items.length === 0) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // Create order (el numero se genera automáticamente por trigger en DB)
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .insert({
          cliente_id: cliente.id,
          subtotal,
          descuento_codigo: descuentoCodigoMonto,
          descuento_promocion: descuentoPromocionMonto,
          descuento_total: descuentoCodigoMonto + descuentoPromocionMonto,
          total,
          estado: 'pendiente',
          notas: notas || null,
        })
        .select()
        .single();

      if (ordenError) {
        console.error('Error en ordenes:', JSON.stringify(ordenError, null, 2));
        console.error('Código:', ordenError.code);
        console.error('Mensaje:', ordenError.message);
        console.error('Detalles:', ordenError.details);
        throw new Error(`Error al crear orden: ${ordenError.message || ordenError.code || 'Error desconocido'}`);
      }

      // Calcular bonificación Saint Felicien para DB
      const sfItemsDB = items.filter(item =>
        item.producto.marca?.nombre?.toLowerCase().includes('saint felicien') ||
        item.producto.nombre?.toLowerCase().includes('saint felicien')
      );
      const cajasDBSF = sfItemsDB.reduce((sum, item) => sum + item.cantidad, 0);
      const bonificacionDBSF = Math.floor(cajasDBSF / 10) * 2;

      // Create order items
      const ordenItems = items.map((item) => ({
        orden_id: orden.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_iva,
        subtotal: item.producto.precio_iva * item.cantidad,
      }));

      // Agregar bonificación como item separado (precio $0)
      if (bonificacionDBSF > 0 && sfItemsDB.length > 0) {
        ordenItems.push({
          orden_id: orden.id,
          producto_id: sfItemsDB[0].producto.id,
          cantidad: bonificacionDBSF,
          precio_unitario: 0,
          subtotal: 0,
        });
      }

      const { error: itemsError } = await supabase.from('orden_items').insert(ordenItems);

      if (itemsError) {
        console.error('Error en orden_items:', JSON.stringify(itemsError, null, 2));
        throw new Error(`Error al crear items: ${itemsError.message || 'Error desconocido'}`);
      }

      // Descargar PDF con el número de orden real
      // Incluir bonificaciones 10+2 Saint Felicien
      const pdfItems: Array<{
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
        producto: { nombre: string; codigo: string; marca?: { nombre: string } | null };
      }> = [];

      // Calcular bonificación Saint Felicien
      const saintFelicienItems = items.filter(item =>
        item.producto.marca?.nombre?.toLowerCase().includes('saint felicien') ||
        item.producto.nombre?.toLowerCase().includes('saint felicien')
      );
      const cajasSF = saintFelicienItems.reduce((sum, item) => sum + item.cantidad, 0);
      const bonificacionSF = Math.floor(cajasSF / 10) * 2;

      items.forEach((item) => {
        pdfItems.push({
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_iva,
          subtotal: item.producto.precio_iva * item.cantidad,
          producto: {
            nombre: item.producto.nombre,
            codigo: item.producto.codigo,
            marca: item.producto.marca,
          },
        });
      });

      // Agregar bonificación como línea separada
      if (bonificacionSF > 0 && saintFelicienItems.length > 0) {
        const primerSF = saintFelicienItems[0];
        pdfItems.push({
          cantidad: bonificacionSF,
          precio_unitario: 0,
          subtotal: 0,
          producto: {
            nombre: `${primerSF.producto.nombre} (BONIFICACIÓN 10+2)`,
            codigo: primerSF.producto.codigo,
            marca: primerSF.producto.marca,
          },
        });
      }

      await descargarOrdenPDF({
        orden: {
          numero: orden.numero,
          subtotal,
          descuento_codigo: descuentoCodigoMonto,
          descuento_promocion: descuentoPromocionMonto,
          total,
          created_at: orden.created_at,
        },
        cliente: {
          razon_social: cliente.razon_social,
          cuit: cliente.cuit,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          provincia: cliente.provincia,
          email: cliente.email,
          telefono: cliente.telefono,
        },
        items: pdfItems,
      });

      // Clear cart and redirect to historial
      clearCart();
      router.push('/historial');
    } catch (error) {
      console.error('Error creating order:', error);

      // Generar número para el fallback
      const numeroFallback = generarNumeroOrden();

      // Descargar PDF como fallback con bonificaciones
      const fallbackItems: Array<{
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
        producto: { nombre: string; codigo: string; marca?: { nombre: string } | null };
      }> = [];

      const sfItems = items.filter(item =>
        item.producto.marca?.nombre?.toLowerCase().includes('saint felicien') ||
        item.producto.nombre?.toLowerCase().includes('saint felicien')
      );
      const sfCajas = sfItems.reduce((sum, item) => sum + item.cantidad, 0);
      const sfBonificacion = Math.floor(sfCajas / 10) * 2;

      items.forEach((item) => {
        fallbackItems.push({
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_iva,
          subtotal: item.producto.precio_iva * item.cantidad,
          producto: {
            nombre: item.producto.nombre,
            codigo: item.producto.codigo,
            marca: item.producto.marca,
          },
        });
      });

      if (sfBonificacion > 0 && sfItems.length > 0) {
        const primerSF = sfItems[0];
        fallbackItems.push({
          cantidad: sfBonificacion,
          precio_unitario: 0,
          subtotal: 0,
          producto: {
            nombre: `${primerSF.producto.nombre} (BONIFICACIÓN 10+2)`,
            codigo: primerSF.producto.codigo,
            marca: primerSF.producto.marca,
          },
        });
      }

      await descargarOrdenPDF({
        orden: {
          numero: numeroFallback,
          subtotal,
          descuento_codigo: descuentoCodigoMonto,
          descuento_promocion: 0,
          total,
          created_at: new Date().toISOString(),
        },
        cliente: {
          razon_social: cliente.razon_social,
          cuit: cliente.cuit,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          provincia: cliente.provincia,
          email: cliente.email,
          telefono: cliente.telefono,
        },
        items: fallbackItems,
      });

      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`No se pudo guardar en el sistema (${errorMsg}), pero se descargó el PDF.`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-texto-muted/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold text-texto mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-texto-muted mb-6">Agregá productos desde nuestro catálogo</p>
          <Link href="/catalogo" className="btn btn-primary">
            Ver Catálogo
          </Link>
        </div>

        {/* Pedidos anteriores */}
        {ordenesAnteriores.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-bordo" />
              <h3 className="font-serif text-lg font-semibold text-texto">Pedidos Anteriores</h3>
            </div>
            <p className="text-sm text-texto-muted mb-4">¿Querés repetir un pedido anterior?</p>
            <div className="space-y-3">
              {ordenesAnteriores.map((orden) => (
                <div key={orden.id} className="flex items-center justify-between p-4 bg-crema rounded-lg">
                  <div>
                    <p className="font-medium text-texto">Orden #{orden.numero}</p>
                    <p className="text-sm text-texto-muted">
                      {formatFecha(orden.created_at)} • {orden.orden_items.length} productos • {formatPrecio(orden.total)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRepetirPedido(orden)}
                    className="btn btn-outline btn-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Repetir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/catalogo" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que querés vaciar el carrito?')) {
                clearCart();
              }
            }}
            className="text-sm text-texto-muted hover:text-bordo transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {items.map((item) => (
          <div
            key={item.producto.id}
            className="card flex flex-col sm:flex-row gap-4"
          >
            {/* Product image placeholder */}
            <div className="w-full sm:w-24 h-20 sm:h-24 bg-crema rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="w-8 h-8 text-bordo/30" />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-texto-muted">{item.producto.marca?.nombre}</span>
              <h3 className="font-serif font-semibold text-texto truncate">
                {item.producto.nombre}
              </h3>
              <p className="text-sm text-texto-muted">{item.producto.presentacion}</p>
              <p className="text-bordo font-semibold mt-1">
                {formatPrecio(item.producto.precio_iva)} / caja
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
              <div className="flex items-center border border-border-strong rounded-lg">
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                  className="p-2 text-texto hover:bg-crema transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-texto">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                  className="p-2 text-texto hover:bg-crema transition-colors"
                  disabled={item.cantidad >= item.producto.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="font-semibold text-texto">
                {formatPrecio(item.producto.precio_iva * item.cantidad)}
              </span>

              <button
                onClick={() => removeItem(item.producto.id)}
                className="p-1 text-texto-muted hover:text-bordo transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <h2 className="font-serif text-xl font-semibold text-texto mb-6">
            Resumen del Pedido
          </h2>

          {/* Beneficios aplicados */}
          <div className="mb-6 p-4 bg-verde-oliva/10 rounded-lg border border-verde-oliva/20">
            <div className="flex items-center gap-2 text-verde-oliva font-semibold mb-3">
              <Gift className="w-5 h-5" />
              Beneficios Aplicados
            </div>

            {/* Descuento 50% general */}
            <div className="flex items-start gap-2 mb-2">
              <Check className="w-4 h-4 text-verde-oliva mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-verde-oliva">Descuento Distribuidor 50%</p>
                <p className="text-xs text-verde-oliva/70">Sobre precios de lista</p>
              </div>
            </div>

            {/* Promoción 10+2 Saint Felicien */}
            {(() => {
              const saintFelicienItems = items.filter(item =>
                item.producto.marca?.nombre?.toLowerCase().includes('saint felicien') ||
                item.producto.nombre?.toLowerCase().includes('saint felicien')
              );
              const cajasSF = saintFelicienItems.reduce((sum, item) => sum + item.cantidad, 0);
              const bonificacion = Math.floor(cajasSF / 10) * 2;

              if (cajasSF >= 10) {
                return (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-verde-oliva/20">
                    <Check className="w-4 h-4 text-verde-oliva mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-verde-oliva">Promoción 10+2 Saint Felicien</p>
                      <p className="text-xs text-verde-oliva/70">
                        {cajasSF} cajas → <span className="font-semibold">+{bonificacion} cajas bonificadas</span>
                      </p>
                    </div>
                  </div>
                );
              } else if (cajasSF > 0) {
                return (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-verde-oliva/20 opacity-60">
                    <AlertCircle className="w-4 h-4 text-texto-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-texto-muted">Promoción 10+2 Saint Felicien</p>
                      <p className="text-xs text-texto-muted">
                        Llevás {cajasSF} cajas, sumá {10 - cajasSF} más para bonificación
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Otras promociones (excluyendo Saint Felicien que ya se muestra como 10+2) */}
            {promocionesAplicables
              .filter((promo) => !promo.titulo?.toLowerCase().includes('saint felicien'))
              .map((promo) => (
              <div key={promo.id} className="flex items-start gap-2 mt-2 pt-2 border-t border-verde-oliva/20">
                <Check className="w-4 h-4 text-verde-oliva mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-verde-oliva">{promo.titulo}</p>
                  <p className="text-xs text-verde-oliva/70">-{promo.valor}% de descuento</p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div className="mb-6">
            <label className="label">Código de descuento</label>
            {codigoDescuento ? (
              <div className="flex items-center justify-between p-3 bg-bordo/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-bordo" />
                  <span className="font-medium text-bordo">{codigoDescuento}</span>
                </div>
                <button
                  onClick={handleQuitarCodigo}
                  className="text-sm text-texto-muted hover:text-bordo"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                  placeholder="CODIGO"
                  className="input flex-1 font-mono"
                />
                <button onClick={handleAplicarCodigo} className="btn btn-outline btn-sm">
                  <Tag className="w-4 h-4" />
                  Aplicar
                </button>
              </div>
            )}
            {codigoError && (
              <p className="text-bordo text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {codigoError}
              </p>
            )}
            {codigoSuccess && (
              <p className="text-verde-oliva text-sm mt-2 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {codigoSuccess}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="label">Notas del pedido (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Instrucciones especiales de entrega..."
              className="input resize-none"
              rows={3}
            />
          </div>

          {/* Totals */}
          <div className="space-y-3 mb-6">
            {/* Precio de lista (sin descuento 50%) */}
            <div className="flex justify-between text-texto-muted">
              <span>Precio de Lista ({items.reduce((sum, i) => sum + i.cantidad, 0)} cajas)</span>
              <span className="line-through">{formatPrecio(subtotal * 2)}</span>
            </div>

            {/* Descuento 50% */}
            <div className="flex justify-between text-verde-oliva">
              <span>Descuento Distribuidor 50%</span>
              <span>-{formatPrecio(subtotal)}</span>
            </div>

            {/* Subtotal con descuento */}
            <div className="flex justify-between text-texto font-medium">
              <span>Subtotal</span>
              <span>{formatPrecio(subtotal)}</span>
            </div>

            {descuentoCodigoMonto > 0 && (
              <div className="flex justify-between text-bordo">
                <span>Descuento código ({descuentoCodigo}%)</span>
                <span>-{formatPrecio(descuentoCodigoMonto)}</span>
              </div>
            )}


            <hr className="border-border" />

            <div className="flex justify-between text-xl font-semibold">
              <span className="text-texto">Total</span>
              <span className="text-bordo">{formatPrecio(total)}</span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleGenerarOrden}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando orden...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generar Orden de Compra
              </>
            )}
          </button>

          {/* Client info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-texto-muted mb-1">Facturar a:</p>
            <p className="font-medium text-texto">{cliente.razon_social}</p>
            <p className="text-sm text-texto-muted">CUIT: {cliente.cuit}</p>
            <p className="text-sm text-texto-muted">{cliente.direccion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
