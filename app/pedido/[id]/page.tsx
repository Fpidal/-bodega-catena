import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { formatPrecio, formatFecha, getEstadoColor, getEstadoTexto } from '@/lib/utils';
import { CheckCircle, Download, ArrowLeft, Package, Calendar, CreditCard, Gift, Check } from 'lucide-react';
import PedidoPDFButton from './PedidoPDFButton';

export const metadata = {
  title: 'Detalle de Pedido - Bodega Catena Zapata',
  description: 'Detalle de orden de compra',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user - REQUIERE LOGIN
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get cliente data
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!cliente) {
    redirect('/login');
  }

  // Get order with items
  const { data: orden } = await supabase
    .from('ordenes')
    .select('*')
    .eq('id', id)
    .eq('cliente_id', cliente.id)
    .single();

  if (!orden) {
    notFound();
  }

  // Get order items with product details
  const { data: items } = await supabase
    .from('orden_items')
    .select('*, producto:productos(*, marca:marcas(nombre))')
    .eq('orden_id', orden.id);

  return (
    <div className="min-h-screen bg-crema">
      <Header
        user={user ? {
          email: user.email || '',
          razon_social: cliente.razon_social,
        } : null}
      />

      <main className="container-narrow pt-24 pb-8">
        {/* Success banner for new orders */}
        {orden.estado === 'pendiente' && (
          <div className="bg-verde-oliva/10 border border-verde-oliva/20 rounded-lg p-6 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-verde-oliva/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-verde-oliva" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-verde-oliva mb-1">
                Orden generada exitosamente
              </h2>
              <p className="text-verde-oliva/80">
                Tu pedido ha sido registrado. Te contactaremos para confirmar la entrega.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/historial" className="text-bordo hover:underline text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al historial
            </Link>
            <h1 className="font-serif text-3xl font-semibold text-texto">
              Orden {orden.numero}
            </h1>
          </div>
          <PedidoPDFButton orden={orden} cliente={cliente} items={items || []} />
        </div>

        {/* Order info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-3">
            <Calendar className="w-5 h-5 text-bordo" />
            <div>
              <p className="text-sm text-texto-muted">Fecha</p>
              <p className="font-medium text-texto">{formatFecha(orden.created_at)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Package className="w-5 h-5 text-bordo" />
            <div>
              <p className="text-sm text-texto-muted">Estado</p>
              <span className={getEstadoColor(orden.estado)}>
                {getEstadoTexto(orden.estado)}
              </span>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-bordo" />
            <div>
              <p className="text-sm text-texto-muted">Total</p>
              <p className="font-semibold text-bordo">{formatPrecio(orden.total)}</p>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="card mb-8">
          <h2 className="font-serif text-lg font-semibold text-texto mb-4">Datos de Facturación</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-texto-muted">Razón Social</p>
              <p className="font-medium text-texto">{cliente.razon_social}</p>
            </div>
            <div>
              <p className="text-texto-muted">CUIT</p>
              <p className="font-medium text-texto">{cliente.cuit}</p>
            </div>
            <div>
              <p className="text-texto-muted">Dirección</p>
              <p className="font-medium text-texto">{cliente.direccion}</p>
            </div>
            <div>
              <p className="text-texto-muted">Ciudad</p>
              <p className="font-medium text-texto">{cliente.ciudad}, {cliente.provincia}</p>
            </div>
          </div>
        </div>

        {/* Beneficios aplicados */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-verde-oliva" />
            <h2 className="font-serif text-lg font-semibold text-texto">Beneficios Aplicados</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Descuento 50% */}
            <div className="flex items-start gap-3 p-3 bg-verde-oliva/10 rounded-lg">
              <Check className="w-5 h-5 text-verde-oliva mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-verde-oliva">Descuento Distribuidor 50%</p>
                <p className="text-sm text-verde-oliva/70">Sobre precios de lista</p>
              </div>
            </div>

            {/* Promoción 10+2 Saint Felicien */}
            {(() => {
              const saintFelicienItems = items?.filter(item =>
                item.producto?.marca?.nombre?.toLowerCase().includes('saint felicien') ||
                item.producto?.nombre?.toLowerCase().includes('saint felicien')
              ) || [];
              const cajasSF = saintFelicienItems.reduce((sum, item) => sum + item.cantidad, 0);
              const bonificacion = Math.floor(cajasSF / 10) * 2;

              if (cajasSF >= 10) {
                return (
                  <div className="flex items-start gap-3 p-3 bg-verde-oliva/10 rounded-lg">
                    <Check className="w-5 h-5 text-verde-oliva mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-verde-oliva">Promoción 10+2 Saint Felicien</p>
                      <p className="text-sm text-verde-oliva/70">
                        {cajasSF} cajas → +{bonificacion} cajas bonificadas
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Order items */}
        <div className="bg-blanco-roto rounded-lg border border-border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold text-texto">Productos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-right">P. Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.id} className={item.precio_unitario === 0 ? 'bg-verde-oliva/5' : ''}>
                    <td className="font-mono text-sm text-texto-muted">
                      {item.producto?.codigo}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-texto">
                          {item.producto?.nombre}
                          {item.precio_unitario === 0 && (
                            <span className="ml-2 text-xs font-semibold text-verde-oliva bg-verde-oliva/10 px-2 py-0.5 rounded">
                              BONIFICACIÓN 10+2
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-texto-muted">{item.producto?.marca?.nombre}</p>
                      </div>
                    </td>
                    <td className="text-center font-medium text-texto">{item.cantidad}</td>
                    <td className="text-right text-texto-muted">
                      {item.precio_unitario === 0 ? (
                        <span className="text-verde-oliva font-medium">$0</span>
                      ) : (
                        formatPrecio(item.precio_unitario)
                      )}
                    </td>
                    <td className="text-right font-semibold text-texto">
                      {item.precio_unitario === 0 ? (
                        <span className="text-verde-oliva">$0</span>
                      ) : (
                        formatPrecio(item.subtotal)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="card">
          <div className="space-y-3">
            {/* Precio de lista (sin descuento 50%) */}
            <div className="flex justify-between text-texto-muted">
              <span>Precio de Lista</span>
              <span className="line-through">{formatPrecio(orden.subtotal * 2)}</span>
            </div>

            {/* Descuento 50% */}
            <div className="flex justify-between text-verde-oliva">
              <span>Descuento Distribuidor 50%</span>
              <span>-{formatPrecio(orden.subtotal)}</span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between text-texto font-medium">
              <span>Subtotal</span>
              <span>{formatPrecio(orden.subtotal)}</span>
            </div>

            {orden.descuento_codigo > 0 && (
              <div className="flex justify-between text-bordo">
                <span>Descuento código</span>
                <span>-{formatPrecio(orden.descuento_codigo)}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between text-xl font-semibold">
              <span className="text-texto">Total</span>
              <span className="text-bordo">{formatPrecio(orden.total)}</span>
            </div>
          </div>

          {orden.notas && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-texto-muted mb-1">Notas:</p>
              <p className="text-texto">{orden.notas}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
