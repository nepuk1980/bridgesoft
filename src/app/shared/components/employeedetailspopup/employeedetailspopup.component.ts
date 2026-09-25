import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-employeedetailspopup',
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './employeedetailspopup.component.html',
  styleUrl: './employeedetailspopup.component.css',
})
export class EmployeedetailspopupComponent {}
