import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ReportService } from '../../services/report.service';

interface Filter {
  value: string;
  viewValue: string;
}

interface AuditEvent {
  employeeName: string;
  eventType: string;
  dataSource: string;
  objectName: string;
  resourceFullPath: string;
  resourceOwner: string;
  eventTime: string;
}

@Component({
  selector: 'app-executive-audit-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InnerheaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './executive-audit-report.component.html',
  styleUrls: ['./executive-audit-report.component.css'],
})
export class ExecutiveAuditReportComponent implements OnInit, AfterViewInit {
  constructor(private reportService: ReportService) {}

  // ================= DATA =================
  private staticAuditData: AuditEvent[] = [
    {
      employeeName: 'Robert Neal',
      eventType: 'FileAccessed',
      dataSource: 'OneDrive',
      objectName: 'Finance',
      resourceFullPath: '/temp/Finance',
      resourceOwner: 'xyz@allegiantair.com',
      eventTime: '2026-04-23 00:29:00',
    },
    {
      employeeName: 'Robert Neal',
      eventType: 'FileAccessed11',
      dataSource: 'OneDrive',
      objectName: 'Finance',
      resourceFullPath: '/temp/Finance',
      resourceOwner: 'xyz@allegiantair.com',
      eventTime: '2026-04-23 00:29:00',
    },
  ];

  displayedColumns: string[] = [
    'employeeName',
    'eventType',
    'dataSource',
    'objectName',
    'resourceFullPath',
    'resourceOwner',
    'eventTime',
  ];

  dataSource = new MatTableDataSource<AuditEvent>([]);
  originalData: AuditEvent[] = [];

  // ================= UI STATE =================
  searchText = '';
  selectedFilter = '';
  selectedDownload: '' | 'pdf' | 'excel' | 'csv' = '';

  filters: Filter[] = [];

  // ================= VIEW CHILDREN =================
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadStaticData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ================= DATA LOAD =================
  loadStaticData(): void {
    const data = this.staticAuditData;

    this.originalData = data;
    this.dataSource.data = data;

    const uniqueEventTypes = Array.from(
      new Set(data.map((x) => x.eventType)),
    ) as string[];

    this.filters = uniqueEventTypes.map((v) => ({
      value: v,
      viewValue: v,
    }));
  }

  // ================= FILTER =================
  applyFilters(): void {
    const search = this.searchText?.toLowerCase().trim() || '';

    const filtered = this.originalData.filter((x) => {
      const matchesFilter =
        !this.selectedFilter || x.eventType === this.selectedFilter;

      const matchesSearch =
        !search ||
        `${x.employeeName} ${x.objectName} ${x.dataSource} ${x.resourceOwner}`
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });

    this.dataSource.data = filtered;
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
    return this.originalData.map((item) => ({
      'Employee Name': item.employeeName,
      'Event Type': item.eventType,
      'Data Source': item.dataSource,
      'Object Name': item.objectName,
      'Resource Full Path': item.resourceFullPath,
      'Resource Owner': item.resourceOwner,
      'Event Time': item.eventTime,
    }));
  }
  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }

  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }

  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }
}
