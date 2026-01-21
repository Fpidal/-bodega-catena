import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrecio, formatFecha } from './utils';

// Logo en base64 (se cargará dinámicamente)
let logoBase64: string | null = null;

// Cargar logo como base64
async function loadLogo(): Promise<string | null> {
  if (logoBase64) return logoBase64;

  try {
    const response = await fetch('https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/bodega%20catena%20lineas%20.jpg');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64 = reader.result as string;
        resolve(logoBase64);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
}

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

export async function generarOrdenPDF({ orden, cliente, items }: GenerarPDFParams): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colores Catena Zapata
  const bordo: [number, number, number] = [114, 47, 55];
  const barrica: [number, number, number] = [93, 64, 55];
  const barricaOscuro: [number, number, number] = [62, 39, 35];
  const crema: [number, number, number] = [248, 245, 240];
  const verdeOliva: [number, number, number] = [85, 107, 47];

  // Cargar logo
  const logo = await loadLogo();

  // ===== HEADER COMPACTO =====
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 32, 'F');

  if (logo) {
    const logoWidth = 60;
    const logoHeight = 21;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logo, 'JPEG', logoX, 4, logoWidth, logoHeight);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...barricaOscuro);
    doc.text('BODEGA CATENA ZAPATA', pageWidth / 2, 15, { align: 'center' });
  }

  // Línea + título + número en una franja
  doc.setFillColor(...crema);
  doc.rect(0, 32, pageWidth, 12, 'F');
  doc.setDrawColor(...bordo);
  doc.setLineWidth(0.3);
  doc.line(14, 32, pageWidth - 14, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...bordo);
  doc.text('ORDEN DE COMPRA', 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...barrica);
  doc.text(`N° ${orden.numero}  •  ${formatFecha(orden.created_at)}`, pageWidth - 14, 40, { align: 'right' });

  // ===== DATOS DEL CLIENTE (compacto) =====
  doc.setFillColor(...barricaOscuro);
  doc.rect(14, 48, pageWidth - 28, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DISTRIBUIDOR', 18, 52.5);

  // Datos en una línea
  doc.setFillColor(253, 252, 250);
  doc.rect(14, 54, pageWidth - 28, 14, 'F');
  doc.setDrawColor(...barrica);
  doc.setLineWidth(0.2);
  doc.rect(14, 54, pageWidth - 28, 14, 'S');

  doc.setTextColor(...barricaOscuro);
  doc.setFontSize(8);

  doc.setFont('helvetica', 'bold');
  doc.text(cliente.razon_social, 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`CUIT: ${cliente.cuit}  •  ${cliente.direccion}  •  ${cliente.ciudad}`, 18, 65);

  // ===== BENEFICIOS (una línea) =====
  const tieneBonificacion = items.some(item => item.producto.nombre.includes('BONIFICACIÓN'));

  doc.setFillColor(240, 248, 240);
  doc.rect(14, 70, pageWidth - 28, 8, 'F');
  doc.setDrawColor(...verdeOliva);
  doc.setLineWidth(0.2);
  doc.rect(14, 70, pageWidth - 28, 8, 'S');

  doc.setTextColor(...verdeOliva);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const beneficiosText = tieneBonificacion
    ? '✓ Descuento Distribuidor 50%  •  ✓ Promoción 10+2 Saint Felicien (ver productos)'
    : '✓ Descuento Distribuidor 50% sobre precios de lista';
  doc.text(beneficiosText, 18, 75);

  const tableStartY = 82;

  // ===== TABLA DE PRODUCTOS =====
  const tableData = items.map((item) => [
    item.producto.codigo,
    item.producto.marca?.nombre || '',
    item.producto.nombre,
    item.cantidad.toString(),
    formatPrecio(item.precio_unitario),
    formatPrecio(item.subtotal),
  ]);

  // Calcular total de cajas
  const totalCajas = items.reduce((sum, item) => sum + item.cantidad, 0);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Cód.', 'Marca', 'Producto', 'Cajas', 'P.Unit.', 'Subtotal']],
    body: tableData,
    foot: [[
      '', '',
      { content: 'Total:', styles: { halign: 'right', fontStyle: 'bold' } },
      { content: totalCajas.toString(), styles: { halign: 'center', fontStyle: 'bold' } },
      '', ''
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: bordo,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: barricaOscuro,
      cellPadding: 2,
    },
    footStyles: {
      fillColor: crema,
      textColor: barricaOscuro,
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 55 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [253, 252, 250],
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
  });

  // ===== TOTALES EN FILA =====
  const pageHeight = doc.internal.pageSize.getHeight();
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // Fila de totales con 4 columnas bien separadas
  doc.setFillColor(...crema);
  doc.rect(14, finalY, pageWidth - 28, 10, 'F');
  doc.setDrawColor(...bordo);
  doc.setLineWidth(0.2);
  doc.rect(14, finalY, pageWidth - 28, 10, 'S');

  const rowY = finalY + 7;
  doc.setFontSize(7);

  // Columna 1: Precio Lista (tachado)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...barrica);
  doc.text('Lista: ', 16, rowY);
  const precioListaText = formatPrecio(orden.subtotal * 2);
  doc.text(precioListaText, 28, rowY);
  const plWidth = doc.getTextWidth(precioListaText);
  doc.setDrawColor(...barrica);
  doc.setLineWidth(0.2);
  doc.line(28, rowY - 1, 28 + plWidth, rowY - 1);

  // Columna 2: Descuento 50%
  doc.setTextColor(...verdeOliva);
  doc.text('Desc 50%: -' + formatPrecio(orden.subtotal), 60, rowY);

  // Columna 3: Subtotal
  doc.setTextColor(...barricaOscuro);
  doc.text('Subtotal: ' + formatPrecio(orden.subtotal), 115, rowY);

  // Columna 4: Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...bordo);
  doc.text('TOTAL: ' + formatPrecio(orden.total), 160, rowY);

  // Nota de contacto
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...barrica);
  doc.text('Contacte a su ejecutivo comercial para confirmar el pedido.', 14, finalY + 16);

  // ===== FOOTER AL PIE DE PÁGINA =====
  const footerY = pageHeight - 12;
  doc.setDrawColor(...bordo);
  doc.setLineWidth(0.2);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('BODEGA CATENA ZAPATA  •  Cobos s/n, Agrelo, Mendoza  •  www.catenawines.com  •  +54 261 490 0214', pageWidth / 2, footerY + 7, { align: 'center' });

  return doc;
}

export async function descargarOrdenPDF(params: GenerarPDFParams): Promise<void> {
  const doc = await generarOrdenPDF(params);
  doc.save(`Orden-${params.orden.numero}-CatenaZapata.pdf`);
}
