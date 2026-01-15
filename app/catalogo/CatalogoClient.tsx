'use client';

import { useState, useMemo } from 'react';
import type { Producto, Marca, Categoria, ProductFilters } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

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

  const filteredProducts = useMemo(() => {
    return productos.filter((producto) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          producto.nombre.toLowerCase().includes(searchLower) ||
          producto.codigo.toLowerCase().includes(searchLower) ||
          producto.marca?.nombre.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Marca filter
      if (filters.marcaId && producto.marca_id !== filters.marcaId) {
        return false;
      }

      // Categoria filter
      if (filters.categoriaId && producto.categoria_id !== filters.categoriaId) {
        return false;
      }

      return true;
    });
  }, [productos, filters]);

  return (
    <>
      <Filters
        filters={filters}
        setFilters={setFilters}
        marcas={marcas}
        categorias={categorias}
        totalProducts={filteredProducts.length}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No se encontraron productos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </>
  );
}
