'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState, Producto, Promocion } from './types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      codigoDescuento: null,
      descuentoCodigo: 0,

      addItem: (producto: Producto, cantidad: number = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.producto.id === producto.id
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].cantidad += cantidad;
            return { items: newItems };
          }

          return {
            items: [...state.items, { producto, cantidad }],
          };
        });
      },

      removeItem: (productoId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto.id !== productoId),
        }));
      },

      updateQuantity: (productoId: string, cantidad: number) => {
        if (cantidad <= 0) {
          get().removeItem(productoId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.producto.id === productoId ? { ...item, cantidad } : item
          ),
        }));
      },

      setCodigoDescuento: (codigo: string | null, porcentaje: number) => {
        set({ codigoDescuento: codigo, descuentoCodigo: porcentaje });
      },

      clearCart: () => {
        set({ items: [], codigoDescuento: null, descuentoCodigo: 0 });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.producto.precio_iva * item.cantidad,
          0
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.cantidad, 0);
      },

      getDescuentoPromocion: (promociones: Promocion[]) => {
        const { items } = get();
        let descuentoTotal = 0;

        // Calcular descuentos por promociones automáticas
        promociones.forEach((promo) => {
          if (!promo.activa || promo.codigo) return; // Solo promociones automáticas (sin código)

          if (promo.marca_id) {
            // Promoción por marca
            const itemsMarca = items.filter(
              (item) => item.producto.marca_id === promo.marca_id
            );
            const cajasTotal = itemsMarca.reduce((sum, item) => sum + item.cantidad, 0);

            if (cajasTotal >= promo.min_cajas) {
              const subtotalMarca = itemsMarca.reduce(
                (sum, item) => sum + item.producto.precio_iva * item.cantidad,
                0
              );

              if (promo.tipo === 'porcentaje') {
                descuentoTotal += (subtotalMarca * promo.valor) / 100;
              } else if (promo.tipo === 'monto_fijo') {
                descuentoTotal += promo.valor;
              }
            }
          } else {
            // Promoción general
            const subtotal = get().getSubtotal();
            const cajasTotal = get().getTotalItems();

            const cumpleMinCajas = promo.min_cajas === 0 || cajasTotal >= promo.min_cajas;
            const cumpleMinMonto = promo.min_monto === 0 || subtotal >= promo.min_monto;

            if (cumpleMinCajas && cumpleMinMonto) {
              if (promo.tipo === 'porcentaje') {
                descuentoTotal += (subtotal * promo.valor) / 100;
              } else if (promo.tipo === 'monto_fijo') {
                descuentoTotal += promo.valor;
              }
            }
          }
        });

        return descuentoTotal;
      },

      getTotal: (promociones: Promocion[]) => {
        const subtotal = get().getSubtotal();
        const descuentoCodigo = (subtotal * get().descuentoCodigo) / 100;
        const descuentoPromocion = get().getDescuentoPromocion(promociones);
        return Math.max(0, subtotal - descuentoCodigo - descuentoPromocion);
      },
    }),
    {
      name: 'catena-cart',
      partialize: (state) => ({
        items: state.items,
        codigoDescuento: state.codigoDescuento,
        descuentoCodigo: state.descuentoCodigo,
      }),
    }
  )
);

// Hook para evitar hydration mismatch
import { useEffect, useState } from 'react';

export function useHydratedCart() {
  const [hydrated, setHydrated] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setHydrated(true);
  }, []);

  return {
    ...store,
    items: hydrated ? store.items : [],
    getTotalItems: () => (hydrated ? store.getTotalItems() : 0),
    getSubtotal: () => (hydrated ? store.getSubtotal() : 0),
  };
}
