import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartEvent, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MydrivepopupComponent } from '../mydrivepopup/mydrivepopup.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilefolderpopupComponent } from '../filefolderpopup/filefolderpopup.component';

// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

export interface TreeNode {
  name: string;
  size?: string;
  totalHitCount?: string;
  classification?: string;
  service?: string;
  sharedBy?: string;
  sharedWith?: string;
  fileName?: string;
  fileType?: string;
  date?: string;
  tag?: string;
  path?: string;

  children?: TreeNode[];
  level?: number;
  expanded?: boolean;
  parent?: TreeNode;
}

export interface Shared {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
}

export interface FilesData {
  title: string;
  count: number;
  increase: number;
  icon: string;
  trend: string;
  file: boolean;
  fileicon: boolean;
}

interface CardData {
  title: string;
  value: number | string;
  file: boolean;
  fileicon: boolean;
  icon: string;
  subtitle?: string;
}

export interface Folder {
  name: string;
  category: string;
  created: string;
}

@Component({
  selector: 'app-cloudresourcespopup',
  imports: [
    CommonModule,
    MatDialogModule,
    BaseChartDirective,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './cloudresourcespopup.component.html',
  styleUrl: './cloudresourcespopup.component.css',
})
export class CloudresourcespopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<CloudresourcespopupComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayedColumns: string[] = [
    'sharedBy',
    'sharedWith',
    'fileName',
    'fileType',
    'date',
  ];

  displayedColumns2: string[] = [
    'name',
    'type',
    'service',
    'lastViewed',
    'lastViewedRecent',
    'tags',
  ];

  dataSource!: MatTableDataSource<Shared>;
  // dataSource2!: MatTableDataSource<externalFiles>;
  @ViewChild('sort1') sort1!: MatSort;
  // @ViewChild('sort2') sort2!: MatSort;

  private dialog = inject(MatDialog);

  driveDialogRef!: MatDialogRef<MydrivepopupComponent>;
  openDriveDialog(element: TreeNode): MatDialogRef<MydrivepopupComponent> {
    if (this.driveDialogRef) {
      this.driveDialogRef.close();
    }

    this.driveDialogRef = this.dialog.open(MydrivepopupComponent, {
      width: '34.375rem',
      hasBackdrop: false,
      minWidth: '34.375rem',
      maxWidth: '100%',
      position: {
        bottom: '4%',
        right: '5%',
      },
      panelClass: 'bottom-right-dialog',

      data: element,
    });

    return this.driveDialogRef;
  }

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
  openDialog(card: CardData, folders: Folder[]) {
    this.dialog.open(FilefolderpopupComponent, {
      width: '58rem',
      minWidth: '58rem',
      maxWidth: '100%',
      data: {
        ...card,
        folders: folders,
      },
    });
  }

  // ngOnInit() {
  //   this.dataSource = new MatTableDataSource(this.data?.shared || []);
  //   // this.dataSource2 = new MatTableDataSource(this.data?.externalFiles || []);
  //   // this.driveDialogRef = this.openDriveDialog();
  // }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort1;
    // this.dataSource2.sort = this.sort2;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    // this.dataSource2.filter = value.trim().toLowerCase();
  }

  closeDialog() {
    if (this.driveDialogRef) {
      this.driveDialogRef.close();
    }
    this.dialogRef.close();
  }

  // chart start here
  public barChartType: 'bar' = 'bar';

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    // Smooth and faster animation
    // animation: {
    //   duration: 0,
    //   easing: 'easeOutQuart',
    // },

    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
      },
    },

    // animations: {
    //   y: {
    //     from: (context) => context.chart.scales['y'].max,
    //     easing: 'easeOutQuart',
    //     duration: 1000,
    //     delay: (context) => context.dataIndex * 150, // each bar delayed 150ms
    //   },
    // },

    scales: {
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,

          color: '#787878', // text color
          padding: 12, // space between bar and label

          font: {
            size: 12,
            weight: 'bold',
          },

          align: 'center',
        },
      },
      y: {
        min: 0,
        max: 250,
        ticks: { display: true },
        grid: { display: true },
        border: { display: false },
      },
    },

    plugins: {
      legend: { display: false },

      // datalabels for top labels
      datalabels: {
        anchor: 'end', // position above the bar
        align: 'end', // align at the top
        color: '#787878', // label color
        font: { weight: 'bold', size: 14 },
        formatter: (value: number) => {
          if (value >= 1000) return `~${(value / 1000).toFixed(1)}K`;
          return `~${value}`;
        },
      },
    },
  };

  public barChartData: ChartData<'bar'> = {
    labels: [['PII'], ['PCI'], ['Federal'], ['Security']],

    datasets: [
      {
        label: 'External Resources',
        data: [100, 90, 15, 15],
        borderRadius: 8,
        categoryPercentage: 1, // creates gap between categories
        barPercentage: 1, // keep bar full width inside category

        barThickness: 84, // exact bar width
        maxBarThickness: 84, // prevent resizing

        backgroundColor: (context) => {
          const { chart, dataIndex, dataset } = context;
          const { ctx, chartArea } = chart;

          if (!chartArea) return '#6C63FF';

          const gradients = [
            ['#E0F2FF', '#2C8ED5'],
            ['#E0F2FF', '#D52C2C'],
            ['#E0F2FF', '#38AE47'],
            ['#E0F2FF', '#81EBFF'],
          ];

          const value = dataset.data[dataIndex] as number;
          const maxValue = Math.max(...(dataset.data as number[]));
          const ratio = value / maxValue;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top,
          );

          gradient.addColorStop(0, gradients[dataIndex][0]);
          gradient.addColorStop(0.25, gradients[dataIndex][1]);

          return gradient;
        },
      },
    ],
  };

  chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }
  // chart end here

  fileData: FilesData[] = [
    {
      title: 'Total Sensitive Files',
      count: 483,
      increase: 386.23,
      icon: '/svg/file.svg',
      file: true,
      fileicon: true,
      trend: 'up',
    },
    {
      title: 'Sensitive Files Containing PII',
      count: 112,
      increase: 123.51,
      icon: '/svg/file.svg',
      file: true,
      fileicon: true,
      trend: 'up',
    },
    {
      title: 'Overexposed Sensitive Files',
      count: 52,
      increase: 221.43,
      icon: '/svg/file.svg',
      file: true,
      fileicon: true,
      trend: 'up',
    },
    {
      title: 'Sensitive Files Containing PCI',
      count: 97,
      increase: 221.43,
      icon: '/svg/file.svg',
      file: true,
      fileicon: true,
      trend: 'up',
    },
  ];

  treeColumns: string[] = ['name', 'size', 'totalHitCount', 'classification'];

  treeData: TreeNode[] = [];

  treeSource: TreeNode[] = [
    {
      name: 'Google Drive',
      size: '1.34 GB',
      totalHitCount: '1.7 K',
      classification: 'PII PCI Security Finance',
      service: 'drive',
      children: [
        {
          name: 'Milton Robsmith',
          size: '234.21 MB',
          totalHitCount: '2.1 K',
          classification: 'PII PCI Security Federal',
          service: 'folder',
          sharedBy: 'Milton Robsmith',
          sharedWith: 'Christopher Williams',
          fileName: 'Finance Policy.xlsx',
          fileType: 'File',
          date: '07/21/2025 02:24 AM',
          tag: 'Private',
          path: '/gsuite/Finance/ Milton Robsmith',

          children: [
            {
              name: 'Employee Payouts 2025.xlsx',
              size: '129.81 MB',
              totalHitCount: '32',
              classification: 'PII PCI Security Finance',
              service: 'file',
            },
            {
              name: 'Employee Benefits.xlsx',
              size: '12.821 MB',
              totalHitCount: '1456',
              classification: 'PII PCI Security',
              service: 'file',
            },
            {
              name: 'Employee Medical.xlsx',
              size: '189.23 KB',
              totalHitCount: '1.2 K',
              classification: 'Security PII PCI Finance',
              service: 'file',
            },
            {
              name: 'Employee Appraisals.xlsx',
              size: '431.75 KB',
              totalHitCount: '12.3 K',
              classification: 'Financial Security PII',
              service: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'Google Drive',
      size: '1.34 GB',
      totalHitCount: '1.7 K',
      classification: 'PII PCI Security Finance',
      service: 'amazon',
      children: [
        {
          name: 'Milton Robsmith',
          size: '234.21 MB',
          totalHitCount: '2.1 K',
          classification: 'PII PCI Security Federal',
          service: 'folder',
          sharedBy: 'William Bridges',
          sharedWith: 'Christopher Williams',
          fileName: 'Finance Policy.xlsx',
          fileType: 'File',
          date: '07/21/2025 02:24 AM',
          tag: 'Private',
          path: '/gsuite/Finance/ William Bridges',
          children: [
            {
              name: 'Employee Payouts 2025.xlsx',
              size: '129.81 MB',
              totalHitCount: '32',
              classification: 'PII PCI Security Finance',
              service: 'file',
            },
            {
              name: 'Employee Benefits.xlsx',
              size: '12.821 MB',
              totalHitCount: '1456',
              classification: 'PII PCI Security',
              service: 'file',
            },
            {
              name: 'Employee Medical.xlsx',
              size: '189.23 KB',
              totalHitCount: '1.2 K',
              classification: 'Security PII PCI Finance',
              service: 'file',
            },
            {
              name: 'Employee Appraisals.xlsx',
              size: '431.75 KB',
              totalHitCount: '12.3 K',
              classification: 'Financial Security PII',
              service: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'Google Drive',
      size: '1.34 GB',
      totalHitCount: '1.7 K',
      classification: 'PII PCI Security Finance',
      service: 'salesforce',
      children: [
        {
         name: 'Milton Robsmith',
          size: '234.21 MB',
          totalHitCount: '2.1 K',
          classification: 'PII PCI Security Federal',
          service: 'folder',
          sharedBy: 'William Bridges',
          sharedWith: 'Christopher Williams',
          fileName: 'Finance Policy.xlsx',
          fileType: 'File',
          date: '07/21/2025 02:24 AM',
          tag: 'Private',
          path: '/gsuite/Finance/ William Bridges',
          children: [
            {
              name: 'Employee Payouts 2025.xlsx',
              size: '129.81 MB',
              totalHitCount: '32',
              classification: 'PII PCI Security Finance',
              service: 'file',
            },
            {
              name: 'Employee Benefits.xlsx',
              size: '12.821 MB',
              totalHitCount: '1456',
              classification: 'PII PCI Security',
              service: 'file',
            },
            {
              name: 'Employee Medical.xlsx',
              size: '189.23 KB',
              totalHitCount: '1.2 K',
              classification: 'Security PII PCI Finance',
              service: 'file',
            },
            {
              name: 'Employee Appraisals.xlsx',
              size: '431.75 KB',
              totalHitCount: '12.3 K',
              classification: 'Financial Security PII',
              service: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'Google Drive',
      size: '1.34 GB',
      totalHitCount: '1.7 K',
      classification: 'PII PCI Security Finance',
      service: 'dropbox',
      children: [
        {
          name: 'Milton Robsmith',
          size: '234.21 MB',
          totalHitCount: '2.1 K',
          classification: 'PII PCI Security Federal',
          service: 'folder',
          sharedBy: 'William Bridges',
          sharedWith: 'Christopher Williams',
          fileName: 'Finance Policy.xlsx',
          fileType: 'File',
          date: '07/21/2025 02:24 AM',
          tag: 'Private',
          path: '/gsuite/Finance/ William Bridges',
          children: [
            {
              name: 'Employee Payouts 2025.xlsx',
              size: '129.81 MB',
              totalHitCount: '32',
              classification: 'PII PCI Security Finance',
              service: 'file',
            },
            {
              name: 'Employee Benefits.xlsx',
              size: '12.821 MB',
              totalHitCount: '1456',
              classification: 'PII PCI Security',
              service: 'file',
            },
            {
              name: 'Employee Medical.xlsx',
              size: '189.23 KB',
              totalHitCount: '1.2 K',
              classification: 'Security PII PCI Finance',
              service: 'file',
            },
            {
              name: 'Employee Appraisals.xlsx',
              size: '431.75 KB',
              totalHitCount: '12.3 K',
              classification: 'Financial Security PII',
              service: 'file',
            },
          ],
        },
      ],
    },
  ];

  flatten(nodes: TreeNode[], level: number = 0, parent?: TreeNode): TreeNode[] {
    let result: TreeNode[] = [];

    nodes.forEach((node) => {
      node.level = level;
      node.parent = parent;
      node.expanded = false;

      result.push(node);

      if (node.children) {
        result = result.concat(this.flatten(node.children, level + 1, node));
      }
    });

    return result;
  }
  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data?.shared || []);
    // this.dataSource2 = new MatTableDataSource(this.data?.externalFiles || []);

    this.treeData = this.flatten(this.treeSource);
  }

  toggle(node: TreeNode) {
    node.expanded = !node.expanded;
  }

  hasChild(node: TreeNode) {
    return node.children && node.children.length > 0;
  }

  isVisible(node: TreeNode) {
    let parent = node.parent;

    while (parent) {
      if (!parent.expanded) return false;
      parent = parent.parent;
    }

    return true;
  }
}
