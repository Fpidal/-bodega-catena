// ===== DATABASE TYPES =====

export interface Marca {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  logo_url: string | null;
  orden: number;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  created_at: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  marca_id: string;
  categoria_id: string;
  presentacion: string;
  unidades_por_caja: number;
  precio_neto: number;
  precio_iva: number;
  precio_botella: number;
  stock: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  marca?: Marca;
  categoria?: Categoria;
}

export interface Cliente {
  id: string;
  user_id: string;
  razon_social: string;
  cuit: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  telefono: string | null;
  email: string;
  tipo_cliente: 'mayorista' | 'distribuidor' | 'restaurante' | 'vinoteca';
  descuento_general: number;
  credito_disponible: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type EstadoOrden = 'pendiente' | 'confirmada' | 'en_proceso' | 'enviada' | 'entregada' | 'cancelada';

export interface Orden {
  id: string;
  numero: string;
  cliente_id: string;
  subtotal: number;
  descuento_codigo: number;
  descuento_promocion: number;
  descuento_total: number;
  total: number;
  estado: EstadoOrden;
  notas: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  cliente?: Cliente;
  items?: OrdenItem[];
}

export interface OrdenItem {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  // Joins
  producto?: Producto;
}

export type TipoPromocion = 'porcentaje' | 'monto_fijo' | 'envio_gratis';

export interface Promocion {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  valor: number;
  codigo: string | null;
  marca_id: string | null;
  categoria_id: string | null;
  min_cajas: number;
  min_monto: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activa: boolean;
  created_at: string;
  // Joins
  marca?: Marca;
}

// ===== CART TYPES =====

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface CartState {
  items: CartItem[];
  codigoDescuento: string | null;
  descuentoCodigo: number;
  addItem: (producto: Producto, cantidad?: number) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  setCodigoDescuento: (codigo: string | null, porcentaje: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getDescuentoPromocion: (promociones: Promocion[]) => number;
  getTotal: (promociones: Promocion[]) => number;
}

// ===== API TYPES =====

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== FILTER TYPES =====

export interface ProductFilters {
  search: string;
  marcaId: string;
  categoriaId: string;
}

// ===== AUTH TYPES =====

export interface AuthUser {
  id: string;
  email: string;
  cliente?: Cliente;
}

// ===== CODIGO DESCUENTO =====

export interface CodigoDescuento {
  codigo: string;
  porcentaje: number;
  descripcion: string;
}

export const CODIGOS_DESCUENTO: CodigoDescuento[] = [
  { codigo: 'BODEGA10', porcentaje: 10, descripcion: '10% de descuento' },
  { codigo: 'MAYORISTA15', porcentaje: 15, descripcion: '15% de descuento para mayoristas' },
  { codigo: 'CATENA20', porcentaje: 20, descripcion: '20% de descuento especial Catena' },
];
