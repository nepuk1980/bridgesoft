import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from '../../shared/components/card/card.component';
import { ExternalresourcespopupComponent } from '../../shared/components/externalresourcespopup/externalresourcespopup.component';
import { FilefolderpopupComponent } from '../../shared/components/filefolderpopup/filefolderpopup.component';
import { CloudresourcespopupComponent } from '../../shared/components/cloudresourcespopup/cloudresourcespopup.component';
import { ApiService } from '../../services/api.service';
import { FileSystemAccessSummaryInterface } from '../../models/type';
import { NgIf } from '@angular/common';
import { ReportService } from '../../services/report.service';

export interface Folder {
  name: string;
  category: string;
  created: string;
}

export interface sharedData {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
  tag: string;
  path: string;
}

export interface externalFilesData {
  name: string;
  type: string;
  serviceType: string;
  service: string;
  lastViewed: string;
  lastViewedRecent: string;
  tags: string[];
}

interface CardData {
  title: string;
  reporttitle?: string;
  value: number | string;
  file: boolean;
  fileicon: boolean;
  icon: string;
  subtitle?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dialog = inject(MatDialog);
  private api = inject(ApiService);
  private reportService = inject(ReportService);

  showSuccess = false;
  fileSystemData: FileSystemAccessSummaryInterface[] = [];
  loadingFs = false;

  // Mock data arrays retained for fallback/other uses if necessary
  FOLDER_DATA_1: Folder[] = [
    /* ... your data ... */
  ];
  Shared: sharedData[] = [
    /* ... your data ... */
  ];
  ExternalFiles: externalFilesData[] = [
    /* ... your data ... */
  ];

  ngOnInit() {
    if (history.state?.submitted) {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    }
    this.getFileSystemAccessSummary();
  }

  getFileSystemAccessSummary() {
    this.loadingFs = true;
    this.api.getfilesystemaccesspermissionsummary().subscribe({
      next: (res: any) => {
        this.fileSystemData = res?.data ?? res ?? [];
        this.loadingFs = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loadingFs = false;
      },
    });
  }

  get fileSystemSummary(): FileSystemAccessSummaryInterface | null {
    return this.fileSystemData.length ? this.fileSystemData[0] : null;
  }

  /**
   * Opens standard file/folder component using dynamic rule category
   */
  openDialog(card: any, ruleCategory: string) {
    this.dialog.open(FilefolderpopupComponent, {
      width: '75rem',
      minWidth: '75rem',
      maxWidth: '100%',
      data: {
        ...card,
        ruleCategory,
      },
    });
  }

  /**
   * FIXED: Corrected signature to accept ruleCategory matching your HTML template call
   */
  openExternalDialog(card: CardData, ruleCategory: string) {
    this.dialog.open(ExternalresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: {
        ...card,
        ruleCategory, // Passed forward so the popup can run its server-side pagination/search query
      },
    });
  }

  /**
   * FIXED: Symmetrically corrected to support dynamic data matching openExternalDialog
   */
  openCloudDialog(card: CardData, ruleCategory: string) {
    this.dialog.open(CloudresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: {
        ...card,
        ruleCategory,
      },
    });
  }

  // Reporting Logic
  reportData = [
    { name: 'John', department: 'IT', salary: 50000 },
    { name: 'Mary', department: 'HR', salary: 45000 },
    { name: 'Alex', department: 'Finance', salary: 60000 },
  ];

  downloadExcel() {
    this.reportService.downloadExcel(this.reportData, 'dashboard-report');
  }

  downloadCSV() {
    this.reportService.downloadCSV(this.reportData, 'dashboard-report');
  }

  downloadPDF() {
    this.reportService.downloadPDF(this.reportData, 'dashboard-report');
  }
}
