import { type ClassValue, clsx } from 'clsx';

// ===== CLASS NAME HELPER =====
// Simple cn implementation without tailwind-merge for lighter bundle
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ===== FORMATTERS =====

/**
 * Formatea un número como precio en pesos argentinos
 */
export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

/**
 * Formatea un número como precio corto (sin símbolo de moneda)
 */
export function formatPrecioCorto(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

/**
 * Formatea una fecha en formato argentino
 */
export function formatFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una fecha con hora
 */
export function formatFechaHora(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea una fecha de forma relativa (hace X días)
 */
export function formatFechaRelativa(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return formatFecha(date);
}

// ===== VALIDATORS =====

/**
 * Valida un CUIT argentino
 */
export function validarCuit(cuit: string): boolean {
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  if (cleanCuit.length !== 11) return false;
  if (!/^\d+$/.test(cleanCuit)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }
  const remainder = sum % 11;
  const verifier = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
  return verifier === parseInt(cleanCuit[10]);
}

/**
 * Formatea un CUIT con guiones
 */
export function formatCuit(cuit: string): string {
  const clean = cuit.replace(/[-\s]/g, '');
  if (clean.length !== 11) return cuit;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}

// ===== HELPERS =====

/**
 * Genera un slug a partir de un texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Trunca un texto a cierta longitud
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Delay para usar con async/await
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Obtiene el color del badge según el estado de la orden
 */
export function getEstadoColor(estado: string): string {
  const colores: Record<string, string> = {
    pendiente: 'badge-warning',
    confirmada: 'badge-terracota',
    en_proceso: 'badge-terracota',
    enviada: 'badge-tierra',
    entregada: 'badge-success',
    cancelada: 'badge bg-gray-200 text-gray-600',
  };
  return colores[estado] || 'badge-tierra';
}

/**
 * Obtiene el texto del estado en español
 */
export function getEstadoTexto(estado: string): string {
  const textos: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    en_proceso: 'En Proceso',
    enviada: 'Enviada',
    entregada: 'Entregada',
    cancelada: 'Cancelada',
  };
  return textos[estado] || estado;
}
