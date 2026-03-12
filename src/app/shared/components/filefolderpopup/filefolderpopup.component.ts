import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit
} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';

export interface Folder {
  name: string;
  category: string;
  created: string;
}

@Component({
  selector: 'app-filefolderpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    FormsModule
  ],
  templateUrl: './filefolderpopup.component.html',
  styleUrls: ['./filefolderpopup.component.css']
})
export class FilefolderpopupComponent implements AfterViewInit, OnInit {

  private dialogRef = inject(MatDialogRef<FilefolderpopupComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayedColumns: string[] = ['name', 'category', 'created'];

  dataSource!: MatTableDataSource<Folder>;

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data?.folders || []);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}