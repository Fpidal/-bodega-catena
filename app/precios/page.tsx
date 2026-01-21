import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { formatPrecio } from '@/lib/utils';
import { Wine, Download } from 'lucide-react';

export const metadata = {
  title: 'Lista de Precios - Bodega Catena Zapata',
  description: 'Lista de precios mayoristas de Bodega Catena Zapata',
};

interface ProductoConMarca {
  id: string;
  codigo: string;
  nombre: string;
  presentacion: string;
  precio_neto: number;
  precio_iva: number;
  precio_botella: number;
  stock: number;
  marca: {
    id: string;
    nombre: string;
    orden: number;
    logo_url: string | null;
  };
  categoria: {
    nombre: string;
  };
}

export default async function PreciosPage() {
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

  // Get all products grouped by marca
  const { data: productos } = await supabase
    .from('productos')
    .select('id, codigo, nombre, presentacion, precio_neto, precio_iva, precio_botella, stock, marca:marcas(id, nombre, orden, logo_url), categoria:categorias(nombre)')
    .eq('activo', true)
    .order('marca_id')
    .order('nombre');

  // Group products by marca
  const productosPorMarca = (productos as unknown as ProductoConMarca[] || []).reduce((acc, producto) => {
    const marcaNombre = producto.marca?.nombre || 'Sin marca';
    if (!acc[marcaNombre]) {
      acc[marcaNombre] = {
        orden: producto.marca?.orden || 999,
        logo_url: producto.marca?.logo_url || null,
        productos: [],
      };
    }
    acc[marcaNombre].productos.push(producto);
    return acc;
  }, {} as Record<string, { orden: number; logo_url: string | null; productos: ProductoConMarca[] }>);

  // Sort by marca orden
  const marcasOrdenadas = Object.entries(productosPorMarca).sort(
    ([, a], [, b]) => a.orden - b.orden
  );

  return (
    <div className="min-h-screen bg-crema">
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

      <main className="container-wide pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-texto-muted text-sm uppercase tracking-wider mb-2">Precios Mayoristas</p>
            <h1 className="font-serif text-3xl font-semibold text-texto">Lista de Precios</h1>
          </div>
          <button className="btn btn-outline btn-sm hidden md:flex">
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>

        {/* Pricing legend */}
        <div className="bg-blanco-roto rounded-lg border border-border p-4 mb-8 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-semibold text-texto">Precio Neto:</span>
            <span className="text-texto-muted ml-2">Sin IVA</span>
          </div>
          <div>
            <span className="font-semibold text-texto">Precio IVA:</span>
            <span className="text-texto-muted ml-2">Por caja</span>
          </div>
          <div>
            <span className="font-semibold text-texto">Precio Botella:</span>
            <span className="text-texto-muted ml-2">Unitario con IVA</span>
          </div>
        </div>

        {/* Price tables by marca */}
        <div className="space-y-8">
          {marcasOrdenadas.map(([marcaNombre, { productos: productosLista, logo_url }]) => (
            <div key={marcaNombre} className="rounded-lg overflow-hidden shadow-sm">
              {/* Brand Header Premium */}
              <div className="brand-header">
                {logo_url ? (
                  <img
                    src={logo_url}
                    alt={marcaNombre}
                    className="brand-logo"
                  />
                ) : (
                  <Wine className="w-6 h-6 text-texto-muted" />
                )}
                <h2 className="brand-name">{marcaNombre}</h2>
                <span className="ml-auto text-texto-muted text-sm font-sans">
                  {productosLista.length} {productosLista.length === 1 ? 'vino' : 'vinos'}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-24">Código</th>
                      <th>Producto</th>
                      <th className="hidden md:table-cell">Categoría</th>
                      <th className="hidden lg:table-cell">Presentación</th>
                      <th className="text-right">Neto</th>
                      <th className="text-right">IVA inc.</th>
                      <th className="text-right hidden sm:table-cell">x Botella</th>
                      <th className="text-center w-20">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosLista.map((producto) => (
                      <tr key={producto.id}>
                        <td className="font-mono text-sm text-texto-muted">{producto.codigo}</td>
                        <td className="font-medium text-texto">{producto.nombre}</td>
                        <td className="hidden md:table-cell text-texto-muted">{producto.categoria?.nombre}</td>
                        <td className="hidden lg:table-cell text-texto-muted">{producto.presentacion}</td>
                        <td className="text-right text-texto-muted">{formatPrecio(producto.precio_neto)}</td>
                        <td className="text-right font-semibold text-texto">
                          {formatPrecio(producto.precio_iva)}
                        </td>
                        <td className="text-right hidden sm:table-cell text-texto-muted">
                          {formatPrecio(producto.precio_botella)}
                        </td>
                        <td className="text-center text-texto-secundario text-sm">
                          {producto.stock === 0 ? (
                            <span className="text-texto-muted">—</span>
                          ) : (
                            <span>{producto.stock}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {marcasOrdenadas.length === 0 && (
          <div className="text-center py-16 bg-blanco-roto rounded-lg border border-border">
            <Wine className="w-16 h-16 text-texto-muted/30 mx-auto mb-4" />
            <p className="text-texto-muted text-lg">No hay productos disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
