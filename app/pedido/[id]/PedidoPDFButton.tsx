'use client';

import { Download } from 'lucide-react';
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
  const handleDownload = () => {
    const pdfItems = items
      .filter((item): item is PDFItem & { producto: PDFProducto } => item.producto !== null && item.producto !== undefined)
      .map((item) => ({
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        producto: {
          nombre: item.producto.nombre,
          codigo: item.producto.codigo,
          marca: item.producto.marca,
        },
      }));

    descargarOrdenPDF({
      orden,
      cliente,
      items: pdfItems,
    });
  };

  return (
    <button onClick={handleDownload} className="btn btn-outline">
      <Download className="w-4 h-4" />
      Descargar PDF
    </button>
  );
}
