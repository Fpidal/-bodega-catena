# Bodega Catena Zapata - Portal CRM Distribuidores

## Contexto del Proyecto

Este es un CRM/Portal de pedidos para distribuidores mayoristas de Bodega Catena Zapata (Mendoza, Argentina). Permite a los distribuidores autorizados:

- Ver el catálogo completo de vinos
- Consultar precios mayoristas
- Realizar pedidos online
- Aplicar códigos de descuento
- Ver historial de órdenes
- Descargar PDFs de órdenes

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS v4 con tema personalizado
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Estado:** Zustand con persistencia
- **PDF:** jsPDF + jsPDF-AutoTable
- **Iconos:** Lucide React
- **Deploy:** Vercel

## Colores de Marca

```css
--terracota: #C75B39      /* Color principal, CTAs */
--crema: #F5E6D3          /* Fondos suaves */
--arena: #E8DCC8          /* Fondos secundarios */
--tierra: #5C4033         /* Textos principales */
--dorado: #B8860B         /* Acentos premium */
```

## Tipografía

- **Títulos:** Cormorant Garamond (serif, elegante)
- **Texto:** Inter (sans-serif, legible)

## Estructura de Carpetas

```
bodega-catena/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home
│   ├── login/             # Autenticación
│   ├── catalogo/          # Catálogo de productos
│   ├── precios/           # Lista de precios
│   ├── carrito/           # Carrito y checkout
│   ├── historial/         # Órdenes pasadas
│   └── pedido/[id]/       # Detalle de orden
├── components/            # Componentes React
├── lib/                   # Utilidades y lógica
│   ├── supabase/          # Clientes Supabase
│   ├── types.ts           # Interfaces TypeScript
│   ├── utils.ts           # Helpers (formatPrecio, etc.)
│   ├── store.ts           # Zustand store
│   └── pdf.ts             # Generador de PDFs
├── supabase/              # SQL para base de datos
│   ├── schema.sql         # Estructura de tablas
│   └── seed.sql           # Datos iniciales
└── middleware.ts          # Protección de rutas
```

## Base de Datos

### Tablas Principales

- `marcas`: 11 marcas de Catena Zapata
- `categorias`: Tintos, Blancos, Rosados, Espumantes, Premium
- `productos`: ~70 productos con precios por caja
- `clientes`: Distribuidores registrados (vinculados a auth.users)
- `ordenes`: Pedidos con numeración automática (OC-2025-XXXX)
- `orden_items`: Items de cada orden
- `promociones`: Descuentos automáticos y códigos

### RLS (Row Level Security)

- Productos y marcas: lectura pública
- Clientes: solo ven su propio perfil
- Órdenes: solo ven sus propias órdenes

## Códigos de Descuento

- `BODEGA10`: 10% descuento
- `MAYORISTA15`: 15% descuento
- `CATENA20`: 20% descuento

## Promociones Automáticas

- 15% en Alamos al comprar 3+ cajas
- 10% en Saint Felicien al comprar 2+ cajas
- Envío gratis en pedidos +$500k

## Comandos Útiles

```bash
npm run dev     # Desarrollo local (localhost:3000)
npm run build   # Build de producción
npm run lint    # Linting
npm run start   # Servidor de producción
```

## Consideraciones de Desarrollo

1. **Autenticación:** Se usa Supabase Auth. Las rutas protegidas (carrito, historial, pedido) redirigen a /login si no hay sesión.

2. **Carrito:** Persiste en localStorage con Zustand. Se usa `useHydratedCart` para evitar hydration mismatch.

3. **Precios:** Todos en pesos argentinos. `precio_iva` es por caja (6 botellas), `precio_botella` es unitario.

4. **PDFs:** Se generan client-side con jsPDF. El diseño usa los colores de la marca.

5. **Server Components:** Las páginas de catálogo y precios usan Server Components para fetch de datos. Los filtros y carrito son Client Components.

## Notas para Claude

- Al hacer cambios en productos/precios, actualizar también seed.sql
- Los números de orden se generan automáticamente con trigger SQL
- El middleware maneja refresh de sesión y redirecciones
- Las promociones automáticas se calculan en el store de Zustand
