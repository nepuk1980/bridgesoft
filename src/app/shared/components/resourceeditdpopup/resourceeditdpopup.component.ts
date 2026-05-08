import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-resourceeditdpopup',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatCheckbox, MatChipsModule],
  templateUrl: './resourceeditdpopup.component.html',
  styleUrls: ['./resourceeditdpopup.component.css'],
})
export class ResourceeditdpopupComponent {}
