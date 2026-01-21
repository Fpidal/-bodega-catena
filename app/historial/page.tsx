import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { formatPrecio, formatFecha, getEstadoColor, getEstadoTexto } from '@/lib/utils';
import { Package, Eye, Calendar, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'Historial de Pedidos - Bodega Catena Zapata',
  description: 'Historial de órdenes de compra',
};

export default async function HistorialPage() {
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

  // Get all orders for this cliente
  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('*, orden_items(count)')
    .eq('cliente_id', cliente.id)
    .order('created_at', { ascending: false });

  // Stats
  const totalOrdenes = ordenes?.length || 0;
  const totalGastado = ordenes?.reduce((sum, o) => sum + o.total, 0) || 0;
  const ultimaOrden = ordenes?.[0];

  return (
    <div className="min-h-screen bg-crema">
      <Header
        user={user ? {
          email: user.email || '',
          razon_social: cliente.razon_social,
        } : null}
      />

      <main className="container-wide pt-24 pb-8">
        <div className="mb-8">
          <p className="text-texto-muted text-sm uppercase tracking-wider mb-2">Tus Pedidos</p>
          <h1 className="font-serif text-3xl font-semibold text-texto">Historial de Pedidos</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-bordo/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-bordo" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-texto">{totalOrdenes}</p>
              <p className="text-sm text-texto-muted">Pedidos realizados</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-verde-oliva/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-verde-oliva" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-texto">{formatPrecio(totalGastado)}</p>
              <p className="text-sm text-texto-muted">Total en compras</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-dorado/10 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-dorado" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-texto">
                {ultimaOrden ? formatFecha(ultimaOrden.created_at) : '-'}
              </p>
              <p className="text-sm text-texto-muted">Último pedido</p>
            </div>
          </div>
        </div>

        {/* Orders table */}
        {ordenes && ordenes.length > 0 ? (
          <div className="bg-blanco-roto rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Fecha</th>
                    <th className="hidden md:table-cell">Items</th>
                    <th>Subtotal</th>
                    <th className="hidden sm:table-cell">Descuentos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((orden) => (
                    <tr key={orden.id}>
                      <td className="font-mono font-medium text-texto">{orden.numero}</td>
                      <td className="text-texto-muted">{formatFecha(orden.created_at)}</td>
                      <td className="hidden md:table-cell text-texto-muted">
                        {(orden.orden_items as { count: number }[])?.[0]?.count || 0} productos
                      </td>
                      <td className="text-texto-muted">{formatPrecio(orden.subtotal)}</td>
                      <td className="hidden sm:table-cell">
                        {orden.descuento_total > 0 ? (
                          <span className="text-verde-oliva">-{formatPrecio(orden.descuento_total)}</span>
                        ) : (
                          <span className="text-texto-muted">-</span>
                        )}
                      </td>
                      <td className="font-semibold text-bordo">{formatPrecio(orden.total)}</td>
                      <td>
                        <span className={getEstadoColor(orden.estado)}>
                          {getEstadoTexto(orden.estado)}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/pedido/${orden.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-blanco-roto rounded-lg border border-border">
            <Package className="w-16 h-16 text-texto-muted/30 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-texto mb-2">
              No hay pedidos todavía
            </h2>
            <p className="text-texto-muted mb-6">Realizá tu primer pedido desde nuestro catálogo</p>
            <Link href="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
