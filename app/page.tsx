import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Link from 'next/link';
import { Wine, Truck, CreditCard, Clock, ArrowRight, Star, Grape } from 'lucide-react';
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
    const { data: ordenesData } = await supabase
      .from('ordenes')
      .select('id, numero, total, estado, created_at')
      .eq('cliente_id', cliente?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    ordenes = ordenesData || [];
  }

  // Get featured products (latest from premium brands)
  const { data: productos } = await supabase
    .from('productos')
    .select('*, marca:marcas(*), categoria:categorias(*)')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Get active promotions
  const { data: promociones } = await supabase
    .from('promociones')
    .select('*, marca:marcas(nombre)')
    .eq('activa', true)
    .limit(3);

  // Get brands
  const { data: marcas } = await supabase
    .from('marcas')
    .select('*')
    .order('orden');

  return (
    <div className="min-h-screen">
      <Header
        user={
          user
            ? {
                email: user.email || '',
                razon_social: cliente?.razon_social,
              }
            : null
        }
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tierra via-tierra to-terracota text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container-wide py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bienvenido al Portal de Distribuidores
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Accedé a nuestra selección completa de vinos premium de Bodega Catena Zapata.
              Pedidos mayoristas con descuentos exclusivos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalogo" className="btn btn-lg bg-white text-tierra hover:bg-crema">
                Ver Catálogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!user && (
                <Link href="/login" className="btn btn-lg border-2 border-white text-white hover:bg-white/10">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-crema py-8">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Wine, text: 'Vinos Premium', desc: '+70 etiquetas' },
              { icon: Truck, text: 'Envío Incluido', desc: 'Pedidos +$500k' },
              { icon: CreditCard, text: 'Pago Flexible', desc: 'Hasta 30 días' },
              { icon: Clock, text: 'Entrega Rápida', desc: '48-72 hs' },
            ].map(({ icon: Icon, text, desc }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-terracota/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-terracota" />
                </div>
                <div>
                  <span className="font-medium text-tierra block">{text}</span>
                  <span className="text-sm text-muted">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      {promociones && promociones.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">
                <Star className="inline-block w-8 h-8 text-dorado mr-2" />
                Promociones Activas
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {promociones.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gradient-to-br from-terracota to-terracota-dark rounded-xl p-6 text-white"
                >
                  <span className="badge bg-white/20 text-white mb-3">
                    {promo.tipo === 'porcentaje' ? `${promo.valor}% OFF` : 'Envío Gratis'}
                  </span>
                  <h3 className="font-serif text-xl font-semibold mb-2">{promo.titulo}</h3>
                  <p className="text-white/80 text-sm mb-4">{promo.descripcion}</p>
                  {promo.codigo && (
                    <div className="bg-white/10 rounded-lg px-4 py-2 inline-block">
                      <span className="text-xs text-white/60">Código:</span>
                      <span className="font-mono font-bold ml-2">{promo.codigo}</span>
                    </div>
                  )}
                  {promo.marca && (
                    <p className="text-sm text-white/70 mt-2">
                      Válido para {promo.marca.nombre}
                      {promo.min_cajas > 0 && ` (mín. ${promo.min_cajas} cajas)`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Orders (if logged in) */}
      {user && ordenes.length > 0 && (
        <section className="section bg-crema/50">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">Pedidos Recientes</h2>
              <Link href="/historial" className="btn btn-ghost btn-sm">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((orden) => (
                    <tr key={orden.id}>
                      <td className="font-medium text-tierra">{orden.numero}</td>
                      <td className="text-muted">{formatFechaRelativa(orden.created_at)}</td>
                      <td className="font-semibold text-terracota">{formatPrecio(orden.total)}</td>
                      <td>
                        <span className={`badge badge-${orden.estado === 'entregada' ? 'success' : orden.estado === 'pendiente' ? 'warning' : 'terracota'}`}>
                          {orden.estado}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/pedido/${orden.id}`}
                          className="text-terracota hover:underline text-sm"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Brands */}
      {marcas && marcas.length > 0 && (
        <section className="section bg-white">
          <div className="container-wide">
            <h2 className="section-title text-center">
              <Grape className="inline-block w-8 h-8 text-terracota mr-2" />
              Nuestras Marcas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {marcas.map((marca) => (
                <Link
                  key={marca.id}
                  href={`/catalogo?marca=${marca.id}`}
                  className="group p-4 bg-crema/50 rounded-xl text-center hover:bg-terracota hover:text-white transition-colors"
                >
                  <Wine className="w-10 h-10 mx-auto mb-2 text-terracota group-hover:text-white transition-colors" />
                  <span className="font-serif font-semibold text-sm">{marca.nombre}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {productos && productos.length > 0 && (
        <section className="section bg-arena/30">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">Productos Destacados</h2>
              <Link href="/catalogo" className="btn btn-outline btn-sm">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-border hover:shadow-md hover:border-terracota/30 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-crema to-arena rounded-lg mb-3 flex items-center justify-center">
                    <Wine className="w-10 h-10 text-terracota/30" />
                  </div>
                  <span className="text-xs text-muted">{producto.marca?.nombre}</span>
                  <h3 className="font-serif font-semibold text-tierra text-sm leading-tight mt-1 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-terracota font-bold mt-2">{formatPrecio(producto.precio_iva)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="bg-tierra text-white py-16">
          <div className="container-wide text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para hacer tu pedido?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Ingresá con tus credenciales de distribuidor para acceder a precios mayoristas
              y promociones exclusivas.
            </p>
            <Link href="/login" className="btn btn-lg bg-terracota hover:bg-terracota-dark text-white">
              Ingresar al Portal
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-foreground text-white/70 py-8">
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
              <p className="text-white/50">Portal exclusivo para distribuidores mayoristas.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
