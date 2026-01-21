'use client';

import { useState } from 'react';
import { Download, Loader2, MessageCircle } from 'lucide-react';
import { descargarOrdenPDF } from '@/lib/pdf';
import { formatPrecio, formatFecha } from '@/lib/utils';

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
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);

  const getPdfItems = () => {
    return items
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
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await descargarOrdenPDF({
        orden,
        cliente,
        items: getPdfItems(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    setLoadingWhatsApp(true);
    try {
      // Primero descarga el PDF
      await descargarOrdenPDF({
        orden,
        cliente,
        items: getPdfItems(),
      });

      // Calcular total de cajas
      const totalCajas = items.reduce((sum, item) => sum + item.cantidad, 0);

      // Crear mensaje para WhatsApp
      const mensaje = `*ORDEN DE COMPRA - Bodega Catena Zapata*

📋 *Orden:* ${orden.numero}
📅 *Fecha:* ${formatFecha(orden.created_at)}

👤 *Cliente:* ${cliente.razon_social}
🏢 *CUIT:* ${cliente.cuit}

📦 *Total cajas:* ${totalCajas}
💰 *Total:* ${formatPrecio(orden.total)}

_El PDF de la orden está descargado. Por favor adjuntalo a este mensaje._`;

      // Abrir WhatsApp Web con el mensaje
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappUrl, '_blank');
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button onClick={handleDownload} disabled={loading || loadingWhatsApp} className="btn btn-outline">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {loading ? 'Generando...' : 'Descargar PDF'}
      </button>

      <button
        onClick={handleWhatsApp}
        disabled={loading || loadingWhatsApp}
        className="btn btn-primary"
        style={{ backgroundColor: '#25D366' }}
      >
        {loadingWhatsApp ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        {loadingWhatsApp ? 'Abriendo...' : 'Enviar por WhatsApp'}
      </button>
    </div>
  );
}
