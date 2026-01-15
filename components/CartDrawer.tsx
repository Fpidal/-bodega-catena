'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useHydratedCart } from '@/lib/store';
import { formatPrecio } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useHydratedCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold text-tierra flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-terracota" />
            Tu Carrito
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-tierra hover:bg-arena transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted/30 mx-auto mb-4" />
              <p className="text-muted">Tu carrito está vacío</p>
              <Link
                href="/catalogo"
                onClick={onClose}
                className="btn btn-primary btn-sm mt-4"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.producto.id}
                  className="flex gap-3 p-3 bg-crema/50 rounded-lg"
                >
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-tierra text-sm truncate">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-xs text-muted">
                      {item.producto.marca?.nombre} · {item.producto.presentacion}
                    </p>
                    <p className="text-sm font-semibold text-terracota mt-1">
                      {formatPrecio(item.producto.precio_iva)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.producto.id)}
                      className="p-1 text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-border rounded bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.producto.id, item.cantidad - 1)
                        }
                        className="p-1 text-tierra hover:bg-arena transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-tierra">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.producto.id, item.cantidad + 1)
                        }
                        className="p-1 text-tierra hover:bg-arena transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs text-muted">
                      {formatPrecio(item.producto.precio_iva * item.cantidad)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-tierra font-medium">Subtotal</span>
              <span className="text-xl font-bold text-terracota">
                {formatPrecio(getSubtotal())}
              </span>
            </div>
            <Link
              href="/carrito"
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Finalizar pedido
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
