import { Component, Input } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-innerheader',
  standalone: true,
  imports: [BreadcrumbComponent, MatButtonModule, NgIf, NgxSkeletonLoaderModule],
  templateUrl: './innerheader.component.html',
  styleUrls: ['./innerheader.component.css']
})
export class InnerheaderComponent {
  @Input() title: string = '';
  @Input() btn: boolean = false;
  @Input() btntitle: string = 'Back';

  constructor(private router: Router, private route: ActivatedRoute) {}

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  
}