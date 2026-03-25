import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit,
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

export interface Folder {
  name: string;
  category: string;
  created: string;
  url?: string;
}

@Component({
  selector: 'app-filefolderpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgIf,
  ],
  templateUrl: './filefolderpopup.component.html',
  styleUrls: ['./filefolderpopup.component.css'],
})
export class FilefolderpopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<FilefolderpopupComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayedColumns: string[] = ['name', 'category', 'created'];

  dataSource!: MatTableDataSource<Folder>;

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    const isFile = this.data?.fileicon; // true = File, false = Folder

    // ✅ Dynamic columns
    this.displayedColumns = isFile
      ? ['name', 'category', 'created'] // you can customize later
      : ['name', 'category', 'created'];

    // ✅ Dynamic mapping
    const mappedData = (this.data?.folders || []).map((item: any) => ({
      name: isFile
        ? (item.fileName ?? item.itemName ?? '-')
        : (item.itemName ?? '-'),

      url: isFile
        ? (item.fileUrl ?? item.itemUrl ?? null)
        : (item.itemUrl ?? null),

      category: isFile
        ? (item.fileType ?? item.itemType ?? '-')
        : (item.itemType ?? '-'),

      created: item.createDatetime
        ? new Date(item.createDatetime).toLocaleDateString()
        : '-',
    }));

    this.dataSource = new MatTableDataSource(mappedData);
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
