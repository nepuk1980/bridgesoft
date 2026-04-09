import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  downloadExcel(data: any[], fileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
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

  downloadCSV(data: any[], fileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });

    saveAs(blob, fileName + '.csv');
  }

  downloadPDF(data: any[], fileName: string) {
    const doc = new jsPDF();

    const columns = Object.keys(data[0]);

    const rows = data.map((obj) =>
      Object.values(obj).map((value) => String(value)),
    );

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save(fileName + '.pdf');
  }
}
