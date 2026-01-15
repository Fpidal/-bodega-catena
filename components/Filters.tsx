'use client';

import { Search, X } from 'lucide-react';
import type { Marca, Categoria, ProductFilters } from '@/lib/types';

interface FiltersProps {
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  marcas: Marca[];
  categorias: Categoria[];
  totalProducts: number;
}

export default function Filters({
  filters,
  setFilters,
  marcas,
  categorias,
  totalProducts,
}: FiltersProps) {
  const hasActiveFilters = filters.search || filters.marcaId || filters.categoriaId;

  const clearFilters = () => {
    setFilters({ search: '', marcaId: '', categoriaId: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10"
            />
          </div>
        </div>

        {/* Marca filter */}
        <div className="md:w-48">
          <select
            value={filters.marcaId}
            onChange={(e) =>
              setFilters({ ...filters, marcaId: e.target.value })
            }
            className="select"
          >
            <option value="">Todas las marcas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria filter */}
        <div className="md:w-48">
          <select
            value={filters.categoriaId}
            onChange={(e) =>
              setFilters({ ...filters, categoriaId: e.target.value })
            }
            className="select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters & count */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted">
          Mostrando <span className="font-semibold text-tierra">{totalProducts}</span> productos
        </p>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-terracota hover:text-terracota-dark transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
