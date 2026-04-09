import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-adduserdpopup',
  imports: [MatDialogModule, MatButtonModule, MatCheckbox],
  templateUrl: './adduserdpopup.component.html',
  styleUrl: './adduserdpopup.component.css',
})
export class AdduserdpopupComponent {}
