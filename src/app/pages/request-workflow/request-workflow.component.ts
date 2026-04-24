import { NgFor } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { RequestAccessWorkflowInterface } from '../../models/type';
import { ReportService } from '../../services/report.service';

interface TableRowImportant {
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  criticality: string;
}

@Component({
  selector: 'app-request-workflow',
  standalone: true,
  imports: [
    InnerheaderComponent,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    MatTabsModule,
    NgFor,
    MatTableModule,
    MatButtonModule,
    RouterModule,
    MatRadioModule,
  ],
  templateUrl: './request-workflow.component.html',
  styleUrl: './request-workflow.component.css',
})
export class RequestWorkflowComponent implements OnInit {
  vaultId: number = 0;

  searchText: string = '';
  selectedCategory: string = '';
  selectedCriticality: string = '';
  selectedFilterIds: number[] = [];
  selectedDownload: string = 'download';

  originalData: TableRowImportant[] = [];
  dataSourceImportant: TableRowImportant[] = [];

  totalCount = 0;
  showingCount = 0;

  categoriesImportant: string[] = [];

  displayedColumnsImportant: string[] = [
    'folderFileName',
    'resourceFullPath',
    'category',
    'criticality',
  ];

  selection = new Set<TableRowImportant>();

  private dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // SEARCH
  onSearch(value: string) {
    this.searchText = value?.trim() || '';
    this.applyFilters();
  }

  // CATEGORY FILTER
  filterCategory(value: string) {
    this.selectedCategory = value || '';
    this.applyFilters();
  }

  // CRITICALITY FILTER
  filterCriticality(value: string) {
    this.selectedCriticality = value || '';
    this.applyFilters();
  }

  // FILE/FOLDER FILTER (API SIDE)
  filterType(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedFilterIds.includes(id)) {
        this.selectedFilterIds.push(id);
      }
    } else {
      this.selectedFilterIds = this.selectedFilterIds.filter((x) => x !== id);
    }

    this.getWorkflowData();
  }

  // RADIO CHANGE
  onCriticalityChange(row: TableRowImportant) {
    row.criticality = row.criticality;
  }

  // APPLY LOCAL FILTERS
  applyFilters() {
    let filtered = [...this.originalData];

    if (this.searchText) {
      const search = this.searchText.toLowerCase();

      filtered = filtered.filter(
        (x) =>
          x.folderFileName.toLowerCase().includes(search) ||
          x.resourceFullPath.toLowerCase().includes(search),
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((x) => x.category === this.selectedCategory);
    }

    if (this.selectedCriticality) {
      filtered = filtered.filter(
        (x) => x.criticality === this.selectedCriticality,
      );
    }

    this.dataSourceImportant = filtered;

    this.showingCount = filtered.length;
    this.totalCount = this.originalData.length;
  }

  // ROW SELECTION
  toggleRow(row: TableRowImportant) {
    if (this.selection.has(row)) {
      this.selection.delete(row);
    } else {
      this.selection.add(row);
    }
  }

  toggleAllRows() {
    if (this.selection.size === this.dataSourceImportant.length) {
      this.selection.clear();
    } else {
      this.dataSourceImportant.forEach((row) => this.selection.add(row));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.dataSourceImportant.length;
  }

  isIndeterminate(): boolean {
    return (
      this.selection.size > 0 &&
      this.selection.size < this.dataSourceImportant.length
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.vaultId = Number(params['vaultId']) || 0;
      this.getWorkflowData();
    });
  }

  // API CALL
  getWorkflowData() {
    const filterString = this.selectedFilterIds.join(',');

    this.api
      .getAllFilesAndFoldersDetails(
        this.vaultId,
        this.searchText,
        this.selectedCategory,
        filterString,
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;

          this.originalData = data.map(
            (item: RequestAccessWorkflowInterface) => ({
              folderFileName: item.itemName,
              resourceFullPath: item.itemUrl,
              category: item.category,
              criticality: 'Open',
            }),
          );

          this.categoriesImportant = [
            ...new Set(this.originalData.map((x) => x.category)),
          ];

          this.applyFilters();

          this.selection.clear();
        },
        error: (err) => {
          console.error('Workflow API error:', err);
        },
      });
  }

  // DATE FORMAT
  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-');

    const time = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/:/g, '-');

    return `${date}_${time}`;
  }

  // EXPORT DATA
  private getExportData() {
    return this.dataSourceImportant.map((item) => ({
      'Folder / File Name': item.folderFileName,
      ResourceFullPath: item.resourceFullPath,
      Category: item.category,
      Criticality: item.criticality,
    }));
  }

  // DOWNLOAD EXCEL
  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadExcel(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }

  // DOWNLOAD CSV
  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadCSV(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }

  // DOWNLOAD PDF
  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadPDF(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }
}
