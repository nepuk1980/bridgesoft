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

  downloadExcel(
    data: any[],
    fileName: string,
    title?: string,
    desc?: string,
    filter?: string,
  ) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
    const headers = Object.keys(data[0] || {});
    const colCount = headers.length;

    let currentRow = 0;
    const merges: any[] = [];

    // 🔵 TITLE (Blue)
    if (title) {
      const rowIndex = currentRow;

      XLSX.utils.sheet_add_aoa(worksheet, [[title]], {
        origin: `A${rowIndex + 1}`,
      });

      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: colCount - 1 },
      });

      const cellRef = `A${rowIndex + 1}`;
      worksheet[cellRef].s = {
        font: { bold: true, sz: 16, color: { rgb: '2F75B5' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };

      currentRow++;
    }

    // 🔘 Helper for gray rows
    const addGrayRow = (text: string) => {
      const rowIndex = currentRow;

      XLSX.utils.sheet_add_aoa(worksheet, [[text]], {
        origin: `A${rowIndex + 1}`,
      });

      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: colCount - 1 },
      });

      const cellRef = `A${rowIndex + 1}`;
      worksheet[cellRef].s = {
        font: { sz: 12, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };

      currentRow++;
    };

    // 🔘 Gray metadata block
    if (desc) addGrayRow(desc);

    addGrayRow(`Date Creation (UTC): ${this.getFormattedDateTime()}`);

    if (filter) addGrayRow(filter);

    // Apply merges
    worksheet['!merges'] = merges;

    // ➕ Spacer row before table
    currentRow++;

    // ✅ Add table
    XLSX.utils.sheet_add_json(worksheet, data, {
      origin: `A${currentRow + 1}`,
      skipHeader: false,
    });

    // ✅ Header styling
    headers.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({
        r: currentRow,
        c: colIndex,
      });

      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: 'E6E6E6' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
    });

    // ✅ Body styling
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let row = currentRow + 1; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { sz: 10, color: { rgb: '323232' } },
            alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
          };

          if (row % 2 === 0) {
            worksheet[cellRef].s.fill = {
              fgColor: { rgb: 'F5F5F5' },
            };
          }
        }
      }
    }

    // ✅ Row heights (match UI look)
    worksheet['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
      worksheet['!rows'][i] = {
        hpt: i === 0 ? 28 : i <= 3 ? 20 : 18,
      };
    }

    // ✅ Column width
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

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, fileName + '.xlsx');
  }

  downloadCSV(
    data: any[],
    fileName: string,
    title?: string,
    desc?: string,
    filter?: string,
  ) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    let meta = '';

    if (title) meta += `${title}\n`;
    if (desc) meta += `${desc}\n`;
    meta += `Date Creation (UTC): ${this.getFormattedDateTime()}\n`;
    if (filter) meta += `${filter}\n`;

    const finalCSV = meta ? `${meta}\n${csvOutput}` : csvOutput;

    const blob = new Blob([finalCSV], {
      type: 'text/csv;charset=utf-8;',
    });

    saveAs(blob, fileName + '.csv');
  }

  downloadPDF(
    data: any[],
    fileName: string,
    title?: string,
    options?: { mode: PdfMode },
    desc?: string,
    filter?: string,
  ) {
    const isWide = options?.mode === 'wide';
    // Use 'l' for landscape, 'pt' for points
    const doc = new jsPDF('l', 'pt', isWide ? 'a3' : 'a4');

    const columns = Object.keys(data[0] || {});
    const rows = data.map((obj) =>
      Object.values(obj).map((val) => String(val ?? '-')),
    );

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 100, // Increased slightly to give the header breathing room
      margin: { top: 10, left: 10, right: 10, bottom: 30 },
      theme: 'plain',
      horizontalPageBreakRepeat: 0,

      styles: {
        cellPadding: isWide ? 2 : 6,
        fontSize: isWide ? 2 : 10,
        overflow: 'linebreak',
        valign: 'top',
      },

      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold',
      },

      bodyStyles: {
        textColor: 50,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      didDrawPage: (dataArg) => {
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const left = 10;
        let y = 25;

        // --- 1. TITLE ---
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 118, 189);
        doc.text(title || 'Events > VIP OD monitoring', left, y);
        y += 20;

        // --- HELPER FUNCTION FOR BOLD LABELS ---
        // This solves the <b> tag issue and manages 'y' position
        const drawMetadataRow = (
          label: string,
          value: string,
          fontSize: number,
        ) => {
          doc.setFontSize(fontSize);
          doc.setTextColor(60);

          // Draw Label (Bold)
          doc.setFont('helvetica', 'bold');
          doc.text(label, left, y);

          const labelWidth = doc.getTextWidth(label + ' ');

          // Draw Value (Normal)
          doc.setFont('helvetica', 'normal');
          const splitText = doc.splitTextToSize(
            value,
            pageWidth - left - labelWidth - 10,
          );
          doc.text(splitText, left + labelWidth, y);

          // Update Y based on how many lines the text took
          const lineCount = Array.isArray(splitText) ? splitText.length : 1;
          y += lineCount * (fontSize + 4);
        };

        // --- 2. DESCRIPTION ---
        drawMetadataRow('Description:', desc || 'No description provided.', 8);

        // --- 3. CREATED DATE ---
        drawMetadataRow(
          'File Creation Date (UTC):',
          this.getFormattedDateTime(),
          7,
        );

        // --- 4. FILTERS ---
        drawMetadataRow('Filters:', filter || 'None', 7);

        // --- FOOTER ---
        if (!isWide) {
          const footerText = `Generated on: ${this.getFormattedDateTime()}`;
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120);
          doc.text(footerText, pageWidth - 14, pageSize.getHeight() - 10, {
            align: 'right',
          });
        }
      },
    });

    doc.save(fileName + '.pdf');
  }
}
