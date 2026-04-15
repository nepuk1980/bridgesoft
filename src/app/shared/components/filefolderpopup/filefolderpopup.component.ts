import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit,
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Folder {
  name: string;
  category: string;
  created: string;
  url?: string;
}

@Component({
  selector: 'app-filefolderpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgIf,
    MatTooltipModule,
  ],
  templateUrl: './filefolderpopup.component.html',
  styleUrls: ['./filefolderpopup.component.css'],
})
export class FilefolderpopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<FilefolderpopupComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reportService: ReportService,
  ) {}

  displayedColumns: string[] = [
    'name',
    'category',
    'adgroup',
    'user',
    'duration',
    'created',
  ];

  dataSource!: MatTableDataSource<Folder>;
  selectedDownload: string = 'Download';

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    const isFile = this.data?.fileicon; // true = File, false = Folder
    console.log('dad', this.data.reporttitle);

    // ✅ Dynamic columns
    this.displayedColumns = isFile
      ? ['name', 'category', 'adgroup', 'user', 'duration', 'created'] // you can customize later
      : ['name', 'category', 'adgroup', 'created'];

    // ✅ Dynamic mapping
    const mappedData = (this.data?.folders || []).map((item: any) => ({
      name: isFile
        ? (item.fileName ?? item.itemName ?? '-')
        : (item.itemName ?? '-'),

      url: isFile
        ? (item.fileUrl ?? item.itemUrl ?? null)
        : (item.itemUrl ?? null),

      category: isFile
        ? (item.fileType ?? item.itemType ?? '-')
        : (item.itemType ?? '-'),
      user: item.userName ?? item.owner ?? '-',
      duration: item.duration ?? '-',
      created: item.createDatetime
        ? new Date(item.createDatetime).toLocaleDateString()
        : '-',
    }));

    this.dataSource = new MatTableDataSource(mappedData);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
    const time = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/:/g, '-'); // HH-MM-SS

    return `${date}_${time}`;
  }
  private getExportData() {
    const isFile = this.data?.fileicon;

    return (this.data?.folders || []).map((item: any) => ({
      'Folder Names': isFile
        ? (item.fileName ?? item.itemName ?? '-')
        : (item.itemName ?? '-'),

      Categories: isFile
        ? (item.fileType ?? item.itemType ?? '-')
        : (item.itemType ?? '-'),

      'Created On': item.createDatetime
        ? new Date(item.createDatetime).toLocaleDateString()
        : '-',
    }));
  }
  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `ashboard-${this.data.reporttitle}_${timestamp}`,
      `Dashboard-${this.data.title}`,
    );
  }

  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `ashboard-${this.data.reporttitle}_${timestamp}`,
      `Dashboard-${this.data.title}`,
    );
  }

  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `ashboard-${this.data.reporttitle}_${timestamp}`,
      `Dashboard-${this.data.title}`,
    );
  }
}
