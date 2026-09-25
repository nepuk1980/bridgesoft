import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-forwardpopup',
  imports: [MatDialogModule, MatButtonModule, MatCheckbox],
  templateUrl: './forwardpopup.component.html',
  styleUrl: './forwardpopup.component.css',
})
export class ForwardpopupComponent {}
