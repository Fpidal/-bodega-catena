'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { descargarOrdenPDF } from '@/lib/pdf';

interface PDFOrden {
  numero: string;
  subtotal: number;
  descuento_codigo: number;
  descuento_promocion: number;
  total: number;
  created_at: string;
}

interface PDFCliente {
  razon_social: string;
  cuit: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  email: string;
  telefono: string | null;
}

interface PDFProducto {
  nombre: string;
  codigo: string;
  marca?: { nombre: string } | null;
}

interface PDFItem {
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: PDFProducto | null;
}

interface PedidoPDFButtonProps {
  orden: PDFOrden;
  cliente: PDFCliente;
  items: PDFItem[];
}

export default function PedidoPDFButton({ orden, cliente, items }: PedidoPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const pdfItems = items
        .filter((item): item is PDFItem & { producto: PDFProducto } => item.producto !== null && item.producto !== undefined)
        .map((item) => ({
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          producto: {
            nombre: item.precio_unitario === 0
              ? `${item.producto.nombre} (BONIFICACIÓN 10+2)`
              : item.producto.nombre,
            codigo: item.producto.codigo,
            marca: item.producto.marca,
          },
        }));

      await descargarOrdenPDF({
        orden,
        cliente,
        items: pdfItems,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading} className="btn btn-outline">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? 'Generando...' : 'Descargar PDF'}
    </button>
  );
}
