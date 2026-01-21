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
    <div className="min-h-screen bg-background">
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

      <main className="container-wide py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-tierra mb-2">Lista de Precios</h1>
            <p className="text-muted">Precios mayoristas actualizados - IVA incluido</p>
          </div>
          <button className="btn btn-outline btn-sm hidden md:flex">
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>

        {/* Pricing legend */}
        <div className="bg-crema rounded-xl p-4 mb-8 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-semibold text-tierra">Precio Neto:</span>
            <span className="text-muted ml-2">Sin IVA</span>
          </div>
          <div>
            <span className="font-semibold text-tierra">Precio IVA:</span>
            <span className="text-muted ml-2">Por caja (6 botellas)</span>
          </div>
          <div>
            <span className="font-semibold text-tierra">Precio Botella:</span>
            <span className="text-muted ml-2">Unitario con IVA</span>
          </div>
        </div>

        {/* Price tables by marca */}
        <div className="space-y-8">
          {marcasOrdenadas.map(([marcaNombre, { productos: productosLista, logo_url }]) => (
            <div key={marcaNombre} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              {/* Marca header */}
              <div className="bg-gradient-to-r from-tierra to-tierra-light px-6 py-4 flex items-center gap-4">
                {logo_url ? (
                  <img
                    src={logo_url}
                    alt={marcaNombre}
                    className="h-10 w-auto object-contain bg-white rounded px-2 py-1"
                  />
                ) : (
                  <Wine className="w-6 h-6 text-white/80" />
                )}
                <h2 className="font-serif text-xl font-semibold text-white">{marcaNombre}</h2>
                <span className="ml-auto text-white/70 text-sm">
                  {productosLista.length} productos
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
                        <td className="font-mono text-sm text-muted">{producto.codigo}</td>
                        <td className="font-medium text-tierra">{producto.nombre}</td>
                        <td className="hidden md:table-cell text-muted">{producto.categoria?.nombre}</td>
                        <td className="hidden lg:table-cell text-muted">{producto.presentacion}</td>
                        <td className="text-right text-muted">{formatPrecio(producto.precio_neto)}</td>
                        <td className="text-right font-semibold text-terracota">
                          {formatPrecio(producto.precio_iva)}
                        </td>
                        <td className="text-right hidden sm:table-cell text-muted">
                          {formatPrecio(producto.precio_botella)}
                        </td>
                        <td className="text-center">
                          {producto.stock === 0 ? (
                            <span className="badge bg-gray-100 text-gray-500">Sin stock</span>
                          ) : producto.stock < 10 ? (
                            <span className="badge-warning">{producto.stock}</span>
                          ) : (
                            <span className="badge-success">{producto.stock}</span>
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
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <Wine className="w-16 h-16 text-muted/30 mx-auto mb-4" />
            <p className="text-muted text-lg">No hay productos disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
