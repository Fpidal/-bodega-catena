# Bodega Catena Zapata - Portal de Distribuidores

Portal CRM para distribuidores mayoristas de Bodega Catena Zapata. Permite realizar pedidos online, consultar precios y gestionar órdenes de compra.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **PDF:** jsPDF
- **Icons:** Lucide React
- **Deploy:** Vercel

## Setup Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bodega-catena.git
cd bodega-catena
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Crear un nuevo proyecto
3. Esperar a que se inicialice (~2 minutos)

### 4. Configurar base de datos

En el SQL Editor de Supabase, ejecutar en orden:

1. **Schema:** Copiar contenido de `supabase/schema.sql` y ejecutar
2. **Seed:** Copiar contenido de `supabase/seed.sql` y ejecutar

### 5. Crear usuario de prueba

En Supabase > Authentication > Users > Add User:

```
Email: distribuidor@test.com
Password: test123456
```

Luego, en SQL Editor, crear el cliente asociado:

```sql
INSERT INTO clientes (
    user_id,
    razon_social,
    cuit,
    direccion,
    ciudad,
    provincia,
    codigo_postal,
    telefono,
    email,
    tipo_cliente
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'distribuidor@test.com'),
    'Distribuidora Test S.A.',
    '30-12345678-9',
    'Av. San Martín 1234',
    'Ciudad de Mendoza',
    'Mendoza',
    '5500',
    '261-1234567',
    'distribuidor@test.com',
    'mayorista'
);
```

### 6. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Las credenciales se encuentran en: Supabase > Project Settings > API

### 7. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

### 1. Crear cuenta en Vercel

Ir a [vercel.com](https://vercel.com) y conectar con GitHub

### 2. Importar proyecto

1. Click en "New Project"
2. Importar el repositorio desde GitHub
3. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy

Vercel hará build y deploy automáticamente. Cada push a `main` triggerea un nuevo deploy.

## Estructura del Proyecto

```
bodega-catena/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Home
│   ├── login/             # Autenticación
│   ├── catalogo/          # Catálogo de productos
│   ├── precios/           # Lista de precios
│   ├── carrito/           # Carrito y checkout
│   ├── historial/         # Historial de órdenes
│   └── pedido/[id]/       # Detalle de orden
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y lógica
│   ├── supabase/          # Clientes Supabase
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Funciones helper
│   ├── store.ts           # Zustand store
│   └── pdf.ts             # Generador de PDFs
├── supabase/              # Scripts SQL
│   ├── schema.sql         # Estructura de DB
│   └── seed.sql           # Datos iniciales
├── middleware.ts          # Middleware de auth
└── public/                # Assets estáticos
```

## Features

- **Catálogo:** Grid de productos con filtros por marca, categoría y búsqueda
- **Precios:** Tabla de precios agrupada por marca
- **Carrito:** Persistente, con códigos de descuento y promociones automáticas
- **Órdenes:** Generación de OC con número automático y PDF descargable
- **Auth:** Login/logout con protección de rutas

## Códigos de Descuento (Demo)

- `BODEGA10` - 10% descuento
- `MAYORISTA15` - 15% descuento
- `CATENA20` - 20% descuento

## Promociones Automáticas

- 15% off en Alamos al comprar 3+ cajas
- 10% off en Saint Felicien al comprar 2+ cajas
- Envío gratis en pedidos +$500k

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Linting
```

## Licencia

Privado - Bodega Catena Zapata
