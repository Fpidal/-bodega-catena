import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { formatPrecio, formatFecha, getEstadoColor, getEstadoTexto } from '@/lib/utils';
import { CheckCircle, Download, ArrowLeft, Package, Calendar, CreditCard } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <Header
        user={user ? {
          email: user.email || '',
          razon_social: cliente.razon_social,
        } : null}
      />

      <main className="container-narrow py-8">
        {/* Success banner for new orders */}
        {orden.estado === 'pendiente' && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-success mb-1">
                Orden generada exitosamente
              </h2>
              <p className="text-success/80">
                Tu pedido ha sido registrado. Te contactaremos para confirmar la entrega.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/historial" className="text-terracota hover:underline text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al historial
            </Link>
            <h1 className="font-serif text-3xl font-bold text-tierra">
              Orden {orden.numero}
            </h1>
          </div>
          <PedidoPDFButton orden={orden} cliente={cliente} items={items || []} />
        </div>

        {/* Order info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-3">
            <Calendar className="w-5 h-5 text-terracota" />
            <div>
              <p className="text-sm text-muted">Fecha</p>
              <p className="font-medium text-tierra">{formatFecha(orden.created_at)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Package className="w-5 h-5 text-terracota" />
            <div>
              <p className="text-sm text-muted">Estado</p>
              <span className={getEstadoColor(orden.estado)}>
                {getEstadoTexto(orden.estado)}
              </span>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-terracota" />
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="font-bold text-terracota">{formatPrecio(orden.total)}</p>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="card mb-8">
          <h2 className="font-serif text-lg font-semibold text-tierra mb-4">Datos de Facturación</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Razón Social</p>
              <p className="font-medium text-tierra">{cliente.razon_social}</p>
            </div>
            <div>
              <p className="text-muted">CUIT</p>
              <p className="font-medium text-tierra">{cliente.cuit}</p>
            </div>
            <div>
              <p className="text-muted">Dirección</p>
              <p className="font-medium text-tierra">{cliente.direccion}</p>
            </div>
            <div>
              <p className="text-muted">Ciudad</p>
              <p className="font-medium text-tierra">{cliente.ciudad}, {cliente.provincia}</p>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold text-tierra">Productos</h2>
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
                  <tr key={item.id}>
                    <td className="font-mono text-sm text-muted">
                      {item.producto?.codigo}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-tierra">{item.producto?.nombre}</p>
                        <p className="text-xs text-muted">{item.producto?.marca?.nombre}</p>
                      </div>
                    </td>
                    <td className="text-center font-medium text-tierra">{item.cantidad}</td>
                    <td className="text-right text-muted">{formatPrecio(item.precio_unitario)}</td>
                    <td className="text-right font-semibold text-tierra">
                      {formatPrecio(item.subtotal)}
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
            <div className="flex justify-between">
              <span className="text-tierra">Subtotal</span>
              <span className="text-tierra">{formatPrecio(orden.subtotal)}</span>
            </div>
            {orden.descuento_codigo > 0 && (
              <div className="flex justify-between text-terracota">
                <span>Descuento código</span>
                <span>-{formatPrecio(orden.descuento_codigo)}</span>
              </div>
            )}
            {orden.descuento_promocion > 0 && (
              <div className="flex justify-between text-success">
                <span>Descuento promoción</span>
                <span>-{formatPrecio(orden.descuento_promocion)}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between text-xl font-bold">
              <span className="text-tierra">Total</span>
              <span className="text-terracota">{formatPrecio(orden.total)}</span>
            </div>
          </div>

          {orden.notas && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted mb-1">Notas:</p>
              <p className="text-tierra">{orden.notas}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
