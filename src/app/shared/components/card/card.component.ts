import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DonutchartComponent } from '../charts/donutchart/donutchart.component';
import { NgIf } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-card',
  imports: [MatCardModule, DonutchartComponent, NgIf, NgxSkeletonLoaderModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() value!: string;
  @Input() filecount!: number;
  @Input() icon!: string;
  @Input() percentage!: number;
  @Input() chart: boolean = false;
  @Input() file: boolean = false;
  @Input() fileicon: boolean = false;
}
