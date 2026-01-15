'use client';

import { Plus, Minus, ShoppingCart, Wine } from 'lucide-react';
import { useState } from 'react';
import type { Producto } from '@/lib/types';
import { formatPrecio } from '@/lib/utils';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(producto, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setCantidad(1);
  };

  const stockBajo = producto.stock < 10;
  const sinStock = producto.stock === 0;

  return (
    <div className="card-hover group">
      {/* Image placeholder */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-crema to-arena rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        <Wine className="w-16 h-16 text-terracota/30 group-hover:scale-110 transition-transform" />
        {producto.marca && (
          <span className="absolute top-2 left-2 badge-tierra text-xs">
            {producto.marca.nombre}
          </span>
        )}
        {stockBajo && !sinStock && (
          <span className="absolute top-2 right-2 badge-warning text-xs">
            Últimas unidades
          </span>
        )}
        {sinStock && (
          <span className="absolute top-2 right-2 badge bg-gray-200 text-gray-600 text-xs">
            Sin stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-semibold text-tierra leading-tight group-hover:text-terracota transition-colors">
          {producto.nombre}
        </h3>
        <p className="text-sm text-muted">{producto.presentacion}</p>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-terracota">
            {formatPrecio(producto.precio_iva)}
          </span>
          <span className="text-xs text-muted">IVA inc.</span>
        </div>

        <p className="text-xs text-muted">
          {formatPrecio(producto.precio_botella)}/botella
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        {!sinStock ? (
          <div className="flex items-center gap-2">
            {/* Quantity selector */}
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="p-2 text-tierra hover:bg-arena transition-colors"
                disabled={cantidad <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-medium text-tierra">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                className="p-2 text-tierra hover:bg-arena transition-colors"
                disabled={cantidad >= producto.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`flex-1 btn btn-sm ${
                added ? 'bg-success text-white' : 'btn-primary'
              }`}
            >
              {added ? (
                'Agregado!'
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Agregar
                </>
              )}
            </button>
          </div>
        ) : (
          <button disabled className="w-full btn btn-sm bg-gray-100 text-gray-400 cursor-not-allowed">
            Sin disponibilidad
          </button>
        )}
      </div>
    </div>
  );
}
