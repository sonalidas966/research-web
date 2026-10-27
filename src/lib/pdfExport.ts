import { jsPDF } from 'jspdf';

/**
 * Downloads plain text file (.txt or .md)
 */
export function downloadAsText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PdfReportSection {
  heading: string;
  body: string;
}

/**
 * Generates an elegant, publication-formatted academic PDF report using jsPDF
 */
export function downloadAsPdf(
  title: string,
  subtitle: string,
  sections: PdfReportSection[],
  filename: string
) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 55;

  // Header Banner
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(margin, currentY, contentWidth, 4, 'F');
  currentY += 24;

  // Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text('AURA RESEARCH — ACADEMIC REPORT', margin, currentY);
  currentY += 18;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 22 + 6;

  // Subtitle / Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`${subtitle} • Generated ${dateStr}`, margin, currentY);
  currentY += 22;

  // Divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 25;

  // Sections
  sections.forEach((sec) => {
    // Check page break for heading
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = 55;
    }

    // Heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(sec.heading.toUpperCase(), margin, currentY);
    currentY += 14;

    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate 700
    const bodyLines = doc.splitTextToSize(sec.body, contentWidth);

    bodyLines.forEach((line: string) => {
      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 55;
      }
      doc.text(line, margin, currentY);
      currentY += 14;
    });

    currentY += 16;
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Aura Research • Evidence-Grounded Scientific Synthesis • Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 25
    );
  }

  doc.save(filename);
}
