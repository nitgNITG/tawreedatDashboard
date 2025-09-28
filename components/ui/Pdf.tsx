
import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { headers, data } = req.body;

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=export-${Date.now()}.pdf`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(16).text('Brand Data Export', { align: 'center' });
    doc.moveDown();

    // Add timestamp
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Create table headers
    const tableTop = 150;
    let currentTop = tableTop;

    // Draw headers
    headers.forEach((header: string, i: number) => {
      doc.fontSize(12)
         .text(header, 50 + (i * 150), currentTop, { width: 140 });
    });

    currentTop += 20;
    doc.moveTo(50, currentTop).lineTo(550, currentTop).stroke();
    currentTop += 10;

    // Draw data rows
    data.forEach((row: any) => {
      if (currentTop > 700) { // Start new page if near bottom
        doc.addPage();
        currentTop = 50;
      }

      Object.values(row).forEach((value: any, i: number) => {
        doc.fontSize(10)
           .text(String(value || ''), 50 + (i * 150), currentTop, { 
             width: 140,
             height: 20,
             ellipsis: true
           });
      });

      currentTop += 20;
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
}