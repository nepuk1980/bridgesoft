import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-donutchart',
  imports: [NgxChartsModule],
  templateUrl: './donutchart.component.html',
  styleUrl: './donutchart.component.css',
})
export class DonutchartComponent {
  @Input() percentage: number = 0;

  view: [number, number] = [150, 150];

  results = [
    { name: 'value', value: this.percentage },
    { name: 'remaining', value: 100 - this.percentage },
  ];

  gradient = false;
  showLegend = true;
  showLabels = true;
  isDoughnut = true;

  colorScheme = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#99D5BE', '#F4F4F4'],
  };
  ngOnChanges(changes: SimpleChanges) {
    if (changes['percentage']) {
      this.updateChart();
    }
  }

  updateChart() {
    const value = Math.min(Math.max(this.percentage, 0), 100);

    this.results = [
      { name: 'value', value: value },
      { name: 'remaining', value: 100 - value },
    ];
  }
}
