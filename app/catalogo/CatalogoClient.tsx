'use client';

import { useState, useMemo } from 'react';
import type { Producto, Marca, Categoria, ProductFilters } from '@/lib/types';
import { formatPrecio } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Search, ChevronUp } from 'lucide-react';

interface CatalogoClientProps {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
}

// Helper para procesar el nombre del producto
function processProductName(nombre: string, marcaNombre: string | undefined) {
  let cleanName = nombre;
  if (marcaNombre) {
    const marcaLower = marcaNombre.toLowerCase();
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.startsWith(marcaLower)) {
      cleanName = nombre.slice(marcaNombre.length).trim();
    }
  }

  // Extraer año si existe
  const yearMatch = cleanName.match(/['']?(\d{2})\b|20(\d{2})\b/);
  let year = '';
  if (yearMatch) {
    const digits = yearMatch[1] || yearMatch[2];
    year = `'${digits}`;
    cleanName = cleanName.replace(yearMatch[0], '').trim();
  } else {
    const isBlanco = cleanName.toLowerCase().includes('chardonnay') ||
                     cleanName.toLowerCase().includes('sauvignon blanc') ||
                     cleanName.toLowerCase().includes('torrontés');
    year = isBlanco ? "'22" : "'21";
  }

  cleanName = cleanName.replace(/^[-–—\s]+/, '').replace(/[-–—\s]+$/, '').trim();

  return { name: cleanName || nombre, year };
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
    const grupos: Record<string, { productos: Producto[], logo_url: string | null }> = {};
    filteredProducts.forEach((p) => {
      const marcaNombre = p.marca?.nombre || 'Sin Marca';
      if (!grupos[marcaNombre]) {
        grupos[marcaNombre] = {
          productos: [],
          logo_url: p.marca?.logo_url || null
        };
      }
      grupos[marcaNombre].productos.push(p);
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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="catalogo-filters">
        <div className="catalogo-filter">
          <Search />
          <select
            value={filters.marcaId}
            onChange={(e) => setFilters({ ...filters, marcaId: e.target.value })}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="catalogo-filter">
          <select
            value={filters.categoriaId}
            onChange={(e) => setFilters({ ...filters, categoriaId: e.target.value })}
          >
            <option value="">Todos los tipos</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Productos por marca */}
      {Object.keys(productosPorMarca).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-texto-muted text-lg">No se encontraron productos.</p>
        </div>
      ) : (
        Object.entries(productosPorMarca).map(([marca, { productos: prods, logo_url }]) => (
          <div key={marca} className="rounded-lg overflow-hidden shadow-sm">
            {/* Brand Header */}
            <div className="catalogo-brand-header">
              {logo_url && (
                <img
                  src={logo_url}
                  alt={marca}
                  className="catalogo-brand-logo"
                />
              )}
              <span className="catalogo-brand-name">{marca}</span>
            </div>

            {/* Products */}
            <div>
              {prods.map((producto) => {
                const stockAlto = producto.stock >= 50;
                const { name: productName, year } = processProductName(
                  producto.nombre,
                  producto.marca?.nombre
                );
                const categoria = producto.categoria?.nombre || 'Tintos';

                return (
                  <div key={producto.id} className="catalogo-product">
                    {/* Info */}
                    <div className="catalogo-product-info">
                      <div className="catalogo-product-main">
                        <span className="catalogo-product-name">{productName}</span>
                        <span className="catalogo-product-year">{year}</span>
                        <span className="catalogo-product-meta">
                          Mendoza | {categoria}
                        </span>
                      </div>
                      <div className="catalogo-product-details">
                        <span className="catalogo-product-presentation">
                          Caja x {producto.unidades_por_caja}
                        </span>
                        {stockAlto && (
                          <span className="catalogo-badge-stock">
                            <ChevronUp />
                            Stock alto
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="catalogo-product-actions">
                      <span className="catalogo-product-price">
                        {formatPrecio(producto.precio_iva)}
                      </span>

                      <div className="catalogo-qty">
                        <button
                          onClick={() => setCantidad(producto.id, getCantidad(producto.id) - 1)}
                          className="catalogo-qty-btn"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={getCantidad(producto.id)}
                          onChange={(e) => setCantidad(producto.id, parseInt(e.target.value) || 1)}
                          className="catalogo-qty-input"
                        />
                        <button
                          onClick={() => setCantidad(producto.id, getCantidad(producto.id) + 1)}
                          className="catalogo-qty-btn"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        className="catalogo-btn-agregar"
                        disabled={producto.stock === 0}
                      >
                        AGREGAR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
