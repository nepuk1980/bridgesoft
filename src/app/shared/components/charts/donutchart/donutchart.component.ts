import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartEvent, ChartType, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-donutchart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './donutchart.component.html',
  styleUrls: ['./donutchart.component.css'],
})
export class DonutchartComponent implements OnChanges {

  @Input() percentage: number = 0;
  @Input() title:string =''

 public doughnutChartType: 'doughnut' = 'doughnut';

  public doughnutChartData: ChartData<'doughnut'> = {
    // labels: [this.title, ''],
    datasets: [
      {
        data: [0, 100],
        backgroundColor: ['#99D5BE', '#F4F4F4'],
        borderWidth: 0
      }
    ]
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    cutout: '30%',   // nicer donut shape
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
         padding: 10,
      },
      datalabels: {
      display: false
    }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['percentage']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    const value = Math.min(Math.max(this.percentage, 0), 100);

    this.doughnutChartData.datasets[0].data = [value, 100 - value];
    // this.doughnutChartData.labels = [this.title, 'Remaining'];
  }

  chartClicked({ event, active }: { event: ChartEvent; active: object[] }): void {
    console.log(event, active);
  }

  chartHovered({ event, active }: { event: ChartEvent; active: object[] }): void {
    console.log(event, active);
  }
}