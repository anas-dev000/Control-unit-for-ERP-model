import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: any) => {
  const doc = new jsPDF() as any;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVOICE', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
  doc.text(`Date: ${format(new Date(invoice.date), 'MMMM dd, yyyy')}`, 14, 35);
  doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}`, 14, 40);

  // Billing Details
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Bill To:', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(invoice.customer?.name || 'Walk-in Customer', 14, 62);
  doc.text(invoice.customer?.email || '', 14, 67);
  doc.text(invoice.customer?.address || '', 14, 72);

  // Table
  const tableData = invoice.items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toLocaleString()}`,
    `$${item.amount.toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 85,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`$${invoice.subtotal.toLocaleString()}`, 180, finalY, { align: 'right' });
  
  doc.text(`Tax (15%):`, 140, finalY + 7);
  doc.text(`$${invoice.taxAmount.toLocaleString()}`, 180, finalY + 7, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total:`, 140, finalY + 17);
  doc.text(`$${invoice.total.toLocaleString()}`, 180, finalY + 17, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
