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
} from 'lucide-react';
import { useHydratedCart } from '@/lib/store';
import { formatPrecio } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Cliente, Promocion } from '@/lib/types';
import { CODIGOS_DESCUENTO } from '@/lib/types';

interface CarritoClientProps {
  cliente: Cliente;
  promociones: Promocion[];
}

export default function CarritoClient({ cliente, promociones }: CarritoClientProps) {
  const router = useRouter();
  const {
    items,
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

  const handleGenerarOrden = async () => {
    if (items.length === 0) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // Create order
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

      if (ordenError) throw ordenError;

      // Create order items
      const ordenItems = items.map((item) => ({
        orden_id: orden.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_iva,
        subtotal: item.producto.precio_iva * item.cantidad,
      }));

      const { error: itemsError } = await supabase.from('orden_items').insert(ordenItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect
      clearCart();
      router.push(`/pedido/${orden.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al generar la orden. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-20 h-20 text-muted/30 mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-semibold text-tierra mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-muted mb-8">Agregá productos desde nuestro catálogo</p>
        <Link href="/catalogo" className="btn btn-primary">
          Ver Catálogo
        </Link>
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
            onClick={() => clearCart()}
            className="text-sm text-muted hover:text-error transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {items.map((item) => (
          <div
            key={item.producto.id}
            className="card flex gap-4"
          >
            {/* Product image placeholder */}
            <div className="w-24 h-24 bg-gradient-to-br from-crema to-arena rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="w-8 h-8 text-terracota/30" />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted">{item.producto.marca?.nombre}</span>
              <h3 className="font-serif font-semibold text-tierra truncate">
                {item.producto.nombre}
              </h3>
              <p className="text-sm text-muted">{item.producto.presentacion}</p>
              <p className="text-terracota font-semibold mt-1">
                {formatPrecio(item.producto.precio_iva)} / caja
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.producto.id)}
                className="p-1 text-muted hover:text-error transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                  className="p-2 text-tierra hover:bg-arena transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-tierra">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                  className="p-2 text-tierra hover:bg-arena transition-colors"
                  disabled={item.cantidad >= item.producto.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="font-semibold text-tierra">
                {formatPrecio(item.producto.precio_iva * item.cantidad)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <h2 className="font-serif text-xl font-semibold text-tierra mb-6">
            Resumen del Pedido
          </h2>

          {/* Applied promotions */}
          {promocionesAplicables.length > 0 && (
            <div className="mb-6 p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2 text-success font-medium mb-2">
                <Gift className="w-4 h-4" />
                Promociones aplicadas
              </div>
              {promocionesAplicables.map((promo) => (
                <p key={promo.id} className="text-sm text-success/80">
                  {promo.titulo}: -{promo.valor}%
                </p>
              ))}
            </div>
          )}

          {/* Discount code */}
          <div className="mb-6">
            <label className="label">Código de descuento</label>
            {codigoDescuento ? (
              <div className="flex items-center justify-between p-3 bg-terracota/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-terracota" />
                  <span className="font-medium text-terracota">{codigoDescuento}</span>
                </div>
                <button
                  onClick={handleQuitarCodigo}
                  className="text-sm text-muted hover:text-error"
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
              <p className="text-error text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {codigoError}
              </p>
            )}
            {codigoSuccess && (
              <p className="text-success text-sm mt-2 flex items-center gap-1">
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
            <div className="flex justify-between text-tierra">
              <span>Subtotal ({items.reduce((sum, i) => sum + i.cantidad, 0)} cajas)</span>
              <span>{formatPrecio(subtotal)}</span>
            </div>

            {descuentoCodigoMonto > 0 && (
              <div className="flex justify-between text-terracota">
                <span>Descuento código ({descuentoCodigo}%)</span>
                <span>-{formatPrecio(descuentoCodigoMonto)}</span>
              </div>
            )}

            {descuentoPromocionMonto > 0 && (
              <div className="flex justify-between text-success">
                <span>Descuento promoción</span>
                <span>-{formatPrecio(descuentoPromocionMonto)}</span>
              </div>
            )}

            <hr className="border-border" />

            <div className="flex justify-between text-xl font-bold">
              <span className="text-tierra">Total</span>
              <span className="text-terracota">{formatPrecio(total)}</span>
            </div>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleGenerarOrden}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              'Generar Orden de Compra'
            )}
          </button>

          {/* Client info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted mb-1">Facturar a:</p>
            <p className="font-medium text-tierra">{cliente.razon_social}</p>
            <p className="text-sm text-muted">CUIT: {cliente.cuit}</p>
            <p className="text-sm text-muted">{cliente.direccion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
