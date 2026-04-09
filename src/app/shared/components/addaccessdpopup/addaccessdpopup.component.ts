import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-addaccessdpopup',
  imports: [MatDialogModule, MatButtonModule, MatCheckbox, MatChipsModule],
  templateUrl: './addaccessdpopup.component.html',
  styleUrl: './addaccessdpopup.component.css',
})
export class AddaccessdpopupComponent {}
