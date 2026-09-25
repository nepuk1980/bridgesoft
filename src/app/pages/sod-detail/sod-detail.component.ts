import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sod-detail',
  imports: [
    InnerheaderComponent,
    MatSlideToggleModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './sod-detail.component.html',
  styleUrl: './sod-detail.component.css',
})
export class SodDetailComponent {
  isChecked = true;
}
