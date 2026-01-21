import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Link from 'next/link';
import { Wine, Truck, CreditCard, Clock, ArrowRight, Package, Grape } from 'lucide-react';
import { formatPrecio, formatFechaRelativa } from '@/lib/utils';

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  let cliente = null;
  let ordenes: Array<{ id: string; numero: string; total: number; estado: string; created_at: string }> = [];

  if (user) {
    // Get cliente data
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    cliente = clienteData;

    // Get recent orders
    if (cliente) {
      const { data: ordenesData } = await supabase
        .from('ordenes')
        .select('id, numero, total, estado, created_at')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(3);
      ordenes = ordenesData || [];
    }
  }

  // Si no está logueado, mostrar página de bienvenida simple
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tierra via-tierra to-terracota relative">
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/imagen%20bodeaga%201.jpeg)' }}
        />

        {/* Header simple */}
        <header className="container-wide py-6 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/logo%20portada.jpeg"
              alt="Bodega Catena Zapata"
              className="h-14 w-auto rounded-lg"
            />
            <div>
              <span className="font-serif text-xl font-semibold text-white block">
                Bodega Catena Zapata
              </span>
              <span className="text-sm text-white/70">Portal de Distribuidores</span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="container-wide py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Portal Exclusivo para Distribuidores
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Accedé a nuestro catálogo completo de vinos premium, realizá pedidos mayoristas
              y gestioná tu cuenta de distribuidor.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { icon: Wine, text: 'Catálogo completo', desc: '+70 etiquetas premium' },
                { icon: CreditCard, text: 'Precios mayoristas', desc: 'Descuentos exclusivos' },
                { icon: Truck, text: 'Pedidos online', desc: 'Gestión simplificada' },
                { icon: Clock, text: 'Historial', desc: 'Seguimiento de órdenes' },
              ].map(({ icon: Icon, text, desc }) => (
                <div key={text} className="bg-white/10 rounded-xl p-4">
                  <Icon className="w-8 h-8 text-white/80 mb-2" />
                  <span className="font-medium text-white block">{text}</span>
                  <span className="text-sm text-white/60">{desc}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-tierra font-semibold px-8 py-4 rounded-xl hover:bg-crema transition-colors text-lg"
            >
              Ingresar al Portal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="container-wide py-8 border-t border-white/10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
            <p>&copy; {new Date().getFullYear()} Bodega Catena Zapata. Todos los derechos reservados.</p>
            <p>Mendoza, Argentina</p>
          </div>
        </footer>
      </div>
    );
  }

  // Usuario logueado - Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{
          email: user.email || '',
          razon_social: cliente?.razon_social,
        }}
      />

      <main className="container-wide py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-tierra mb-2">
            Bienvenido, {cliente?.razon_social || 'Distribuidor'}
          </h1>
          <p className="text-muted">Accedé a tu catálogo y gestioná tus pedidos</p>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/catalogo"
            className="card hover:border-terracota/50 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-terracota/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-terracota/20 transition-colors">
              <Wine className="w-6 h-6 text-terracota" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-tierra mb-1">Catálogo</h3>
            <p className="text-sm text-muted">Ver productos y hacer pedidos</p>
          </Link>

          <Link
            href="/precios"
            className="card hover:border-terracota/50 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-dorado/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-dorado/20 transition-colors">
              <CreditCard className="w-6 h-6 text-dorado" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-tierra mb-1">Lista de Precios</h3>
            <p className="text-sm text-muted">Precios mayoristas actualizados</p>
          </Link>

          <Link
            href="/carrito"
            className="card hover:border-terracota/50 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
              <Package className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-tierra mb-1">Carrito</h3>
            <p className="text-sm text-muted">Revisar y confirmar pedido</p>
          </Link>

          <Link
            href="/historial"
            className="card hover:border-terracota/50 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-tierra/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-tierra/20 transition-colors">
              <Clock className="w-6 h-6 text-tierra" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-tierra mb-1">Historial</h3>
            <p className="text-sm text-muted">Ver pedidos anteriores</p>
          </Link>
        </div>

        {/* Recent Orders */}
        {ordenes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-tierra">Pedidos Recientes</h2>
              <Link href="/historial" className="text-terracota text-sm hover:underline">
                Ver todos
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-crema/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tierra">N° Orden</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tierra">Fecha</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-tierra">Total</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-tierra">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-crema/30">
                    <td className="px-6 py-4 font-medium text-tierra">{orden.numero}</td>
                    <td className="px-6 py-4 text-muted">{formatFechaRelativa(orden.created_at)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-terracota">{formatPrecio(orden.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge badge-${orden.estado === 'entregada' ? 'success' : orden.estado === 'pendiente' ? 'warning' : 'terracota'}`}>
                        {orden.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state if no orders */}
        {ordenes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <Grape className="w-16 h-16 text-muted/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-tierra mb-2">
              Comenzá a hacer pedidos
            </h3>
            <p className="text-muted mb-6">
              Explorá nuestro catálogo de vinos premium y realizá tu primer pedido
            </p>
            <Link href="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white/70 py-8 mt-8">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracota rounded-full flex items-center justify-center">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-white block">
                  Bodega Catena Zapata
                </span>
                <span className="text-sm">Mendoza, Argentina</span>
              </div>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Bodega Catena Zapata. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
