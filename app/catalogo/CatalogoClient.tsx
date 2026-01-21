'use client';

import { useState, useMemo } from 'react';
import type { Producto, Marca, Categoria, ProductFilters } from '@/lib/types';
import { formatPrecio } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Search, Plus, Minus, ShoppingCart, Filter } from 'lucide-react';

interface CatalogoClientProps {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
}

export default function CatalogoClient({
  productos,
  marcas,
  categorias,
}: CatalogoClientProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    marcaId: '',
    categoriaId: '',
  });
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  const { addItem, items } = useCartStore();

  const filteredProducts = useMemo(() => {
    return productos.filter((producto) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          producto.nombre.toLowerCase().includes(searchLower) ||
          producto.codigo.toLowerCase().includes(searchLower) ||
          producto.marca?.nombre.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.marcaId && producto.marca_id !== filters.marcaId) {
        return false;
      }

      if (filters.categoriaId && producto.categoria_id !== filters.categoriaId) {
        return false;
      }

      return true;
    });
  }, [productos, filters]);

  // Agrupar por marca
  const productosPorMarca = useMemo(() => {
    const grupos: Record<string, Producto[]> = {};
    filteredProducts.forEach((p) => {
      const marcaNombre = p.marca?.nombre || 'Sin Marca';
      if (!grupos[marcaNombre]) grupos[marcaNombre] = [];
      grupos[marcaNombre].push(p);
    });
    return grupos;
  }, [filteredProducts]);

  const getCantidad = (id: string) => cantidades[id] || 1;

  const setCantidad = (id: string, cant: number) => {
    if (cant < 1) cant = 1;
    if (cant > 999) cant = 999;
    setCantidades({ ...cantidades, [id]: cant });
  };

  const agregarAlCarrito = (producto: Producto) => {
    const cant = getCantidad(producto.id);
    addItem(producto, cant);
    setCantidades({ ...cantidades, [producto.id]: 1 });
  };

  const getEnCarrito = (id: string) => {
    const item = items.find(i => i.producto.id === id);
    return item?.cantidad || 0;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o marca..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10 w-full"
            />
          </div>

          {/* Marca */}
          <select
            value={filters.marcaId}
            onChange={(e) => setFilters({ ...filters, marcaId: e.target.value })}
            className="input md:w-48"
          >
            <option value="">Todas las marcas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>

          {/* Categoría */}
          <select
            value={filters.categoriaId}
            onChange={(e) => setFilters({ ...filters, categoriaId: e.target.value })}
            className="input md:w-48"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 text-sm text-muted">
          {filteredProducts.length} productos encontrados
        </div>
      </div>

      {/* Tabla de productos por marca */}
      {Object.keys(productosPorMarca).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No se encontraron productos con los filtros seleccionados.</p>
        </div>
      ) : (
        Object.entries(productosPorMarca).map(([marca, prods]) => (
          <div key={marca} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="bg-tierra px-6 py-3">
              <h2 className="font-serif text-xl font-semibold text-white">{marca}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-crema/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-tierra">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-tierra">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-tierra hidden md:table-cell">Categoría</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-tierra">Precio</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-tierra w-32">Cantidad</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-tierra w-24">Agregar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {prods.map((producto) => {
                    const enCarrito = getEnCarrito(producto.id);
                    return (
                      <tr key={producto.id} className="hover:bg-crema/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-muted">{producto.codigo}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-tierra">{producto.nombre}</span>
                            {producto.descripcion && (
                              <p className="text-xs text-muted mt-0.5">{producto.descripcion}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">
                          {producto.categoria?.nombre || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-terracota">{formatPrecio(producto.precio_iva)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setCantidad(producto.id, getCantidad(producto.id) - 1)}
                              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-crema transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={getCantidad(producto.id)}
                              onChange={(e) => setCantidad(producto.id, parseInt(e.target.value) || 1)}
                              className="w-14 h-8 text-center border border-border rounded-lg text-sm"
                            />
                            <button
                              onClick={() => setCantidad(producto.id, getCantidad(producto.id) + 1)}
                              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-crema transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => agregarAlCarrito(producto)}
                            className="btn btn-primary btn-sm"
                            title="Agregar al carrito"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          {enCarrito > 0 && (
                            <div className="text-xs text-success mt-1">
                              {enCarrito} en carrito
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
