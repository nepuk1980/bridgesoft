import { NgFor, NgIf } from '@angular/common';
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
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';

type Important = {
  policyName: string;
  rule: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
};

interface TableRowImportant {
  policyName: string;
  rule: string;
  folderFileName: string;
  type: 'folder' | 'file';
  resourceFullPath: string;
}

@Component({
  selector: 'app-request-workflow',
  imports: [
    InnerheaderComponent,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    MatTabsModule,
    NgFor,
    NgIf,
    MatTableModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './request-workflow.component.html',
  styleUrl: './request-workflow.component.css',
})
export class RequestWorkflowComponent implements OnInit {
  isLoading = true;

  // ✅ FIXED: required variables
  searchText: string = '';
  selectedCategory: string = '';
  selectedType: string = '';
  originalData: TableRowImportant[] = [];

  data: Important[] = [
    {
      policyName: 'File share business SOD Policy',
      rule: 'Any person having access to Legal should not have access to Human Resources',
      folderOrFileNames: {
        type: 'folder' as const,
        name: 'Legal',
      },
      resourceFullPath:
        'https://bridgesoft.sharepoint.com/sites/legal/Folder/Legal',
    },
    {
      policyName:
        'SOD Policy Internal Auditor Access - Windows Administrator Access',
      rule: 'Internal Auditor Access - Windows Administrator Access Constraint',
      folderOrFileNames: {
        type: 'file' as const,
        name: 'Human Resources.xls',
      },
      resourceFullPath:
        'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
    },
  ];

  allColumnsImportant: string[] = [
    'policyName',
    'rule',
    'folderFileName',
    'resourceFullPath',
  ];

  displayedColumnsImportant: string[] = [...this.allColumnsImportant];

  dataSourceImportant: TableRowImportant[] = [];

  totalCount = 0;
  showingCount = 0;

  selection = new Set<TableRowImportant>();

  categoriesImportant: string[] = [];
  categoriesOpen: string[] = [];

  private dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ✅ APPLY FILTERS
  applyFilters() {
    let filtered = [...this.originalData];

    if (this.searchText) {
      filtered = filtered.filter(
        (row) =>
          row.policyName?.toLowerCase().includes(this.searchText) ||
          row.rule?.toLowerCase().includes(this.searchText) ||
          row.folderFileName?.toLowerCase().includes(this.searchText),
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(
        (row) => row.policyName === this.selectedCategory,
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((row) => row.type === this.selectedType);
    }

    this.dataSourceImportant = filtered;
    this.showingCount = filtered.length;
  }

  onSearch(value: string) {
    this.searchText = value.toLowerCase();
    this.applyFilters();
  }

  filterCategory(value: string) {
    this.selectedCategory = value || '';
    this.applyFilters();
  }

  filterType(type: string) {
    this.selectedType = type || '';
    this.applyFilters();
  }

  updateColumns(cols: string[]) {
    this.displayedColumnsImportant = cols;
  }

  toggleColumn(column: string, event: any) {
    event.stopPropagation();

    const index = this.displayedColumnsImportant.indexOf(column);

    if (index >= 0) {
      this.displayedColumnsImportant.splice(index, 1);
    } else {
      this.displayedColumnsImportant.push(column);
    }

    this.displayedColumnsImportant = [...this.displayedColumnsImportant];
  }

  toggleAllColumns(event: any) {
    event.stopPropagation();

    if (
      this.displayedColumnsImportant.length === this.allColumnsImportant.length
    ) {
      this.displayedColumnsImportant = [];
    } else {
      this.displayedColumnsImportant = [...this.allColumnsImportant];
    }
  }

  // ✅ ROW SELECTION FIXED
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
    // ✅ Using local data (since tabs not defined here)
    this.originalData = this.data.map((item: Important) => ({
      policyName: item.policyName,
      rule: item.rule,
      folderFileName: item.folderOrFileNames.name,
      type: item.folderOrFileNames.type,
      resourceFullPath: item.resourceFullPath,
    }));

    this.dataSourceImportant = [...this.originalData];

    this.totalCount = this.originalData.length;
    this.showingCount = this.dataSourceImportant.length;

    this.categoriesImportant = [
      ...new Set(this.originalData.map((row) => row.policyName)),
    ];

    this.isLoading = false;
  }
}
