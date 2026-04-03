import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';

interface TableElement {
  id: number;
  issuer: string;
  filefoldername: string;
  percentcomplete: string;
  phase: string;
  phaseend: string;
  tags: string;
  certifiers: string;
  due: string;
  signdate: string;
}

@Component({
  selector: 'app-review-access-detail',
  standalone: true,
  imports: [InnerheaderComponent, BaseChartDirective, MatTableModule],
  templateUrl: './review-access-detail.component.html',
  styleUrls: ['./review-access-detail.component.css'],
})
export class ReviewAccessDetailComponent {
  public doughnutChartType: 'doughnut' = 'doughnut';

  public doughnutChartData1: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [2, 137, 0, 0, 0],
        backgroundColor: [
          '#81C9FF',
          '#98D5BE',
          '#81EBFF',
          '#97B7BD',
          '#D2D2D2',
        ],
        borderWidth: 0,
      },
    ],
  };

  public doughnutChartData2: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [0, 0, 0, 0, 100],
        backgroundColor: [
          '#81C9FF',
          '#98D5BE',
          '#81EBFF',
          '#97B7BD',
          '#D2D2D2',
        ],
        borderWidth: 0,
      },
    ],
  };

  public doughnutChartData3: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [0, 0, 0, 0, 100],
        backgroundColor: [
          '#81C9FF',
          '#98D5BE',
          '#81EBFF',
          '#97B7BD',
          '#D2D2D2',
        ],
        borderWidth: 0,
      },
    ],
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, padding: 10 },
      datalabels: { display: false },
    },
  };

  updateChartData(chart: ChartData<'doughnut'>, newData: number[]) {
    chart.datasets[0].data = newData;
    // If using ViewChild(BaseChartDirective), you can call update() to reflect changes
  }

  chartClicked({ event, active }: { event: any; active: any[] }): void {
    console.log(event, active);
  }

  chartHovered({ event, active }: { event: any; active: any[] }): void {
    console.log(event, active);
  }

  TABLE_DATA: TableElement[] = [
    {
      id: 1,
      issuer: 'Administrator',
      filefoldername: 'Medical Reimbursements.xls',
      percentcomplete: '1.44% (2 of 139)',
      phase: 'End',
      phaseend: '02/ 12 / 26  11:12 AM',
      tags: '-',
      certifiers: '-',
      due: '02/ 12 / 26  16:38 PM',
      signdate: '02 / 12 / 26  12:34 PM',
    },
  ];

  displayedColumns: string[] = [
    'issuer',
    'filefoldername',
    'percentcomplete',
    'phase',
    'phaseend',
    'tags',
    'certifiers',
    'due',
    'signdate',
  ];
  dataSource = new MatTableDataSource<TableElement>(this.TABLE_DATA);
}
