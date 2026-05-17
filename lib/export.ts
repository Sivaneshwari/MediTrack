import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export function exportToExcel(data: ExportData, filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.title);
  
  // Auto-size columns
  const colWidths = data.headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.rows.map(row => String(row[i] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(data: ExportData, filename: string, reportTo?: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(20, 143, 119); // Teal color
  doc.text('MEDiTRACK', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.title, 14, 30);
  
  // Report info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, 38);
  
  if (reportTo) {
    doc.text(`Report for: ${reportTo}`, 14, 44);
  }
  
  // Table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: reportTo ? 50 : 44,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [20, 143, 119],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 250, 249],
    },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
}

export function shareData(title: string, text: string, url?: string) {
  if (navigator.share) {
    navigator.share({
      title,
      text,
      url: url || window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    const shareText = `${title}\n\n${text}\n\n${url || window.location.href}`;
    navigator.clipboard.writeText(shareText);
    return true; // indicates copied to clipboard
  }
}
