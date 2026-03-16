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

// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

export interface Shared {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
}
export interface externalFiles {
  name: string;
  type: string;
  service: string;
  serviceType: string;
  lastViewed: string;
  lastViewedRecent: string;
  tags: string[];
}

@Component({
  selector: 'app-externalresourcespopup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BaseChartDirective,
    MatTableModule,
    MatSortModule,
  ],
  templateUrl: './externalresourcespopup.component.html',
  styleUrls: ['./externalresourcespopup.component.css'],
})
export class ExternalresourcespopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<ExternalresourcespopupComponent>);

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
  dataSource2!: MatTableDataSource<externalFiles>;
@ViewChild('sort1') sort1!: MatSort;
@ViewChild('sort2') sort2!: MatSort;

  private dialog = inject(MatDialog);

  driveDialogRef!: MatDialogRef<MydrivepopupComponent>;
openDriveDialog(element: Shared): MatDialogRef<MydrivepopupComponent> {

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

 
    data: element
  });

  return this.driveDialogRef;
}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data?.shared || []);
    this.dataSource2 = new MatTableDataSource(this.data?.externalFiles || []);
    // this.driveDialogRef = this.openDriveDialog();
  }

  ngAfterViewInit() {
   this.dataSource.sort = this.sort1;
  this.dataSource2.sort = this.sort2;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource2.filter = value.trim().toLowerCase();
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
        left: 0,
        right: 0,
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
        max: 14000,
        ticks: { display: false },
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
    labels: [
      ['Stale', 'Resources'],
      ['Private'],
      ['Shared', 'External'],
      ['Sensitive', 'Files'],
      ['Public'],
      ['Shared Internal', 'Files'],
    ],

    datasets: [
      {
        label: 'External Resources',
        data: [12700, 12300, 2970, 2550, 1180, 1170],
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
            ['#E0F2FF', '#2599AF'],
            ['#E0F2FF', '#374EE2'],
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
          gradient.addColorStop(0.4, gradients[dataIndex][1]);

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
}
