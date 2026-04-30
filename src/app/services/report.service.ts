import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
type PdfMode = 'default' | 'wide';
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  downloadExcel(data: any[], fileName: string, title?: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
    const headers = Object.keys(data[0] || {});
    const colCount = headers.length;

    // ✅ Title
    if (title) {
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });

      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      ];

      worksheet['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '1176BD' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }

    // ✅ Add data
    XLSX.utils.sheet_add_json(worksheet, data, {
      origin: 'A3',
      skipHeader: false,
    });

    // ✅ Header styling (match PDF)
    headers.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 2, c: colIndex });

      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: 'E6E6E6' } }, // light gray
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
    });

    // ✅ Body styling
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let row = 3; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { sz: 10, color: { rgb: '323232' } },
            alignment: { horizontal: 'left', vertical: 'center', indent: 2 },
          };

          // ✅ Alternate row shading (like PDF)
          if (row % 2 === 0) {
            worksheet[cellRef].s.fill = {
              fgColor: { rgb: 'F5F5F5' },
            };
          }
        }
      }
    }

    // ✅ Row height (simulate spacing like PDF)
    worksheet['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
      worksheet['!rows'][i] = { hpt: i === 0 ? 24 : 18 }; // title bigger
    }

    // ✅ Auto column width
    worksheet['!cols'] = headers.map((key) => ({
      wch:
        Math.max(
          key.length,
          ...data.map((row) => (row[key] ? row[key].toString().length : 5)),
        ) + 4,
    }));

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, fileName + '.xlsx');
  }

  downloadCSV(data: any[], fileName: string, title?: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    let finalCSV = csvOutput;

    if (title) {
      finalCSV = `${title}\n\n${csvOutput}`; // title + empty line
    }

    const blob = new Blob([finalCSV], {
      type: 'text/csv;charset=utf-8;',
    });

    saveAs(blob, fileName + '.csv');
  }
  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    const time = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `${date} ${time}`;
  }

  downloadPDF(
    data: any[],
    fileName: string,
    title?: string,
    options?: { mode: PdfMode },
  ) {
    const isWide = options?.mode === 'wide';

    const doc = new jsPDF('l', 'pt', isWide ? 'a3' : 'a4');

    const columns = Object.keys(data[0] || {});
    const rows = data.map((obj) =>
      Object.values(obj).map((val) => String(val ?? '-')),
    );

    autoTable(doc, {
      head: [columns],
      body: rows,

      startY: 55,

      margin: {
        top: 55,
        left: 40,
        right: 40,
        bottom: 30,
      },

      theme: 'plain',

      // 🔥 IMPORTANT FIX FOR 100 COLUMNS
      horizontalPageBreak: isWide, // only for wide reports
      horizontalPageBreakRepeat: 0,

      // ❌ DO NOT FORCE WIDTH (this was causing compression)
      // tableWidth removed intentionally

      styles: {
        cellPadding: isWide ? 2 : 6,
        fontSize: isWide ? 5 : 10,
        overflow: 'linebreak',
        valign: 'top',
      },

      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold',
        fontSize: isWide ? 6 : 10,
      },

      bodyStyles: {
        fontSize: isWide ? 5 : 10,
        textColor: 50,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      tableLineWidth: 0,

      didDrawCell: (dataArg) => {
        if (dataArg.section === 'body') {
          const { doc } = dataArg;

          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(3);

          doc.line(
            dataArg.cell.x,
            dataArg.cell.y + dataArg.cell.height,
            dataArg.cell.x + dataArg.cell.width,
            dataArg.cell.y + dataArg.cell.height,
          );
        }
      },

      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 118, 189);
        doc.text(title || 'Reports', 40, 40);

        // Footer
        const footerText = `Generated on: ${this.getFormattedDateTime()}`;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);

        doc.text(footerText, pageWidth - 14, pageHeight - 10, {
          align: 'right',
        });
      },
    });

    doc.save(fileName + '.pdf');
  }
}
