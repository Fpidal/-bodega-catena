import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrecio, formatFecha } from './utils';

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

interface PDFItem {
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: {
    nombre: string;
    codigo: string;
    marca?: { nombre: string } | null;
  };
}

interface GenerarPDFParams {
  orden: PDFOrden;
  cliente: PDFCliente;
  items: PDFItem[];
}

export function generarOrdenPDF({ orden, cliente, items }: GenerarPDFParams): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colores de la marca
  const terracota: [number, number, number] = [199, 91, 57];
  const tierra: [number, number, number] = [92, 64, 51];
  const crema: [number, number, number] = [245, 230, 211];

  // ===== HEADER =====
  doc.setFillColor(...crema);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Título principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...tierra);
  doc.text('Bodega Catena Zapata', pageWidth / 2, 18, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setTextColor(...terracota);
  doc.text('Orden de Compra', pageWidth / 2, 28, { align: 'center' });

  // Número de orden y fecha
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...tierra);
  doc.text(`N° ${orden.numero}`, 14, 40);
  doc.text(`Fecha: ${formatFecha(orden.created_at)}`, pageWidth - 14, 40, { align: 'right' });

  // ===== DATOS DEL CLIENTE =====
  doc.setFillColor(...terracota);
  doc.rect(14, 50, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DATOS DEL CLIENTE', 18, 55.5);

  doc.setTextColor(...tierra);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const clienteData = [
    [`Razón Social: ${cliente.razon_social}`, `CUIT: ${cliente.cuit}`],
    [`Dirección: ${cliente.direccion}`, `Ciudad: ${cliente.ciudad}, ${cliente.provincia}`],
    [`Email: ${cliente.email}`, `Teléfono: ${cliente.telefono || '-'}`],
  ];

  let yPos = 65;
  clienteData.forEach((row) => {
    doc.text(row[0], 14, yPos);
    doc.text(row[1], pageWidth / 2, yPos);
    yPos += 6;
  });

  // ===== TABLA DE PRODUCTOS =====
  const tableData = items.map((item) => [
    item.producto.codigo,
    item.producto.nombre,
    item.producto.marca?.nombre || '',
    item.cantidad.toString(),
    formatPrecio(item.precio_unitario),
    formatPrecio(item.subtotal),
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Código', 'Producto', 'Marca', 'Cant.', 'P. Unitario', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: terracota,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: tierra,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 55 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [252, 250, 247],
    },
  });

  // ===== TOTALES =====
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Box de totales
  const boxWidth = 80;
  const boxX = pageWidth - boxWidth - 14;

  doc.setFillColor(...crema);
  doc.roundedRect(boxX, finalY, boxWidth, 45, 3, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...tierra);

  const totalesY = finalY + 10;
  doc.text('Subtotal:', boxX + 5, totalesY);
  doc.text(formatPrecio(orden.subtotal), boxX + boxWidth - 5, totalesY, { align: 'right' });

  if (orden.descuento_codigo > 0) {
    doc.text('Desc. Código:', boxX + 5, totalesY + 8);
    doc.setTextColor(...terracota);
    doc.text(`-${formatPrecio(orden.descuento_codigo)}`, boxX + boxWidth - 5, totalesY + 8, { align: 'right' });
    doc.setTextColor(...tierra);
  }

  if (orden.descuento_promocion > 0) {
    doc.text('Desc. Promoción:', boxX + 5, totalesY + 16);
    doc.setTextColor(...terracota);
    doc.text(`-${formatPrecio(orden.descuento_promocion)}`, boxX + boxWidth - 5, totalesY + 16, { align: 'right' });
    doc.setTextColor(...tierra);
  }

  // Línea separadora
  doc.setDrawColor(...terracota);
  doc.line(boxX + 5, totalesY + 24, boxX + boxWidth - 5, totalesY + 24);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', boxX + 5, totalesY + 32);
  doc.setTextColor(...terracota);
  doc.text(formatPrecio(orden.total), boxX + boxWidth - 5, totalesY + 32, { align: 'right' });

  // ===== FOOTER =====
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(...crema);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...tierra);
  doc.text('Bodega Catena Zapata - Mendoza, Argentina', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('www.catenawines.com | contacto@catenazapata.com', pageWidth / 2, footerY + 14, { align: 'center' });

  return doc;
}

export function descargarOrdenPDF(params: GenerarPDFParams): void {
  const doc = generarOrdenPDF(params);
  doc.save(`orden-${params.orden.numero}.pdf`);
}
