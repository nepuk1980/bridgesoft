import {
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  HostListener,
  ElementRef
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogState
} from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-mydrivepopup',
  imports: [
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './mydrivepopup.component.html',
  styleUrls: ['./mydrivepopup.component.css'],
})
export class MydrivepopupComponent implements OnInit {

  readonly panelOpenState = signal(false);

  private dialogRef = inject(MatDialogRef<MydrivepopupComponent>);
  private elementRef = inject(ElementRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}

// @HostListener('document:click', ['$event'])
// onClick(event: MouseEvent) {

//   const isOutside = !this.elementRef.nativeElement.contains(event.target);

//   if (isOutside && this.dialogRef.getState() === MatDialogState.OPEN) {
//     alert('Clicked outside dialog');
//   }

// }

  closeDialog() {
    this.dialogRef.close();
  }
}