import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from '../../shared/components/card/card.component';
import { ExternalresourcespopupComponent } from '../../shared/components/externalresourcespopup/externalresourcespopup.component';
import { FilefolderpopupComponent } from '../../shared/components/filefolderpopup/filefolderpopup.component';
import { CloudresourcespopupComponent } from '../../shared/components/cloudresourcespopup/cloudresourcespopup.component';
import { ApiService } from '../../services/api.service';
import { FileSystemAccessSummaryInterface } from '../../models/type';
import { NgIf } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
export class DashboardComponent {
  private dialog = inject(MatDialog);

  // Folder datasets
  FOLDER_DATA_1: Folder[] = [
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  FOLDER_DATA_2: Folder[] = [
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  FOLDER_DATA_3: Folder[] = [
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  Shared: sharedData[] = [
    {
      sharedBy: 'William Bridges',
      sharedWith: 'Christopher Williams',
      fileName: 'Finance Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Amanda Jones',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Perks.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Peter Biel',
      sharedWith: 'Randy Jefferson',
      fileName: 'Vendor Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Brenda Jenna',
      sharedWith: 'Miroslav L',
      fileName: 'Medical Insurance.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Ashley Smithson',
      sharedWith: 'Christopher Williams',
      fileName: 'Vendor Legal.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Deepak Sharma',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Onboarding.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'William Bridges',
      sharedWith: 'Christopher Williams',
      fileName: 'Finance Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Amanda Jones',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Perks.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Peter Biel',
      sharedWith: 'Randy Jefferson',
      fileName: 'Vendor Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Brenda Jenna',
      sharedWith: 'Miroslav L',
      fileName: 'Medical Insurance.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Ashley Smithson',
      sharedWith: 'Christopher Williams',
      fileName: 'Vendor Legal.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Deepak Sharma',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Onboarding.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
  ];

  ExternalFiles: externalFilesData[] = [
    {
      name: 'Employee DB 2025.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '01/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Vendor List Domestic.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 14:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Policies.xlsx',
      type: 'File',
      service: 'Test3',
      serviceType: 'amazon',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '02/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Medical Policies.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Device List.xlsx',
      type: 'File',
      service: 'Staging S2',
      serviceType: 'dropbox',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '07/21/2025 02:24 AM',
      tags: ['Sensitive'],
    },
    {
      name: 'Code of Conduct Policy.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Work from home policy.pdf',
      type: 'File',
      service: 'Inbound Enquiries',
      serviceType: 'dropbox',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Uniform & Accessories.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Office Overheads.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee DB 2025.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '01/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Vendor List Domestic.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 14:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Policies.xlsx',
      type: 'File',
      service: 'Test3',
      serviceType: 'amazon',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '02/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Medical Policies.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Device List.xlsx',
      type: 'File',
      service: 'Staging S2',
      serviceType: 'dropbox',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '07/21/2025 02:24 AM',
      tags: ['Sensitive'],
    },
    {
      name: 'Code of Conduct Policy.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Work from home policy.pdf',
      type: 'File',
      service: 'Inbound Enquiries',
      serviceType: 'dropbox',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Uniform & Accessories.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Office Overheads.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
  ];

  // openDialog(card: CardData, folders: Folder[]) {
  //   this.dialog.open(FilefolderpopupComponent, {
  //     width: '58rem',
  //     minWidth: '58rem',
  //     maxWidth: '100%',
  //     data: {
  //       ...card,
  //       folders: folders,
  //     },
  //   });
  // }

  openExternalDialog(
    card: CardData,
    shared: sharedData[],
    externalFiles: externalFilesData[],
  ) {
    this.dialog.open(ExternalresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: {
        ...card,
        shared,
        externalFiles,
      },
    });
  }

  openCloudDialog(
    card: CardData,
    shared: sharedData[],
    externalFiles: externalFilesData[],
  ) {
    this.dialog.open(CloudresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: {
        ...card,
        shared,
        externalFiles,
      },
    });
  }

  //   ngOnInit(): void {
  //   this.dialog.open(CloudresourcespopupComponent, {
  //     width: '95%',
  //     minWidth: '95%',
  //     maxWidth: '100%',
  //     data: {
  //       title: 'Cloud Resources',
  //       value: '46%',
  //       file: true,
  //       fileicon: true,
  //       icon: '/svg/file.svg',
  //       subtitle: 'External Sources',
  //       shared: this.Shared,
  //       externalFiles: this.ExternalFiles
  //     }
  //   });
  // }

  //   openNotificationDialog() {
  //   this.dialog.open(NotificationpopupComponent, {
  //      width: '85.75rem',
  //     minWidth: '85.75rem',
  //     maxWidth: '100%',
  // data: {
  //   icon: '/svg/folder.svg',
  //   fileicon: false,
  //   notifications: [
  //     { name: 'Folder 1', category: 'General', created: '10 Mar 2026' },
  //     { name: 'Folder 2', category: 'HR', created: '11 Mar 2026' },
  //     { name: 'File 1', category: 'Finance', created: '12 Mar 2026' }
  //   ]
  // }
  //   });
  // }
  //  ngOnInit(): void {
  //   this.openNotificationDialog(); // ✅ Opens dialog by default
  // }

  showSuccess = false;

  constructor(
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  ngOnInit() {
    if (history.state?.submitted) {
      this.showSuccess = true;

      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    }
    this.getFileSystemAccessSummary();
  }
  // ✅ API DATA
  fileSystemData: FileSystemAccessSummaryInterface[] = [];
  loadingFs = false;

  getFileSystemAccessSummary() {
    this.loadingFs = true;

    this.api.getfilesystemaccesspermissionsummary().subscribe({
      next: (res: any) => {
        // ✅ correct handling (array response)
        this.fileSystemData = res?.data ?? res ?? [];

        this.loadingFs = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loadingFs = false;
      },
    });
  }

  // ✅ clean getter (best practice)
  get fileSystemSummary(): FileSystemAccessSummaryInterface | null {
    return this.fileSystemData.length ? this.fileSystemData[0] : null;
  }

  openDialog(card: any, ruleCategory: string) {
    this.api
      .getFilesystemAccessPermissionDetails(ruleCategory, 0, 1000000)
      .subscribe({
        next: (res: any) => {
          const folders = res?.content ?? res?.data ?? res ?? [];

          this.dialog.open(FilefolderpopupComponent, {
            width: '58rem',
            minWidth: '58rem',
            maxWidth: '100%', // ✅ added
            data: {
              ...card,
              folders,
            },
          });
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

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
