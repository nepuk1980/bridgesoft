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
import { NgFor, NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface Folder {
  name: string;
  category: string;
  created: string;
  url?: string;
}

const FOLDER_DATA: Folder[] = [
  { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
  {
    name: 'Conflict of Interest',
    category: 'HIPAA',
    created: '11 / 03 / 2025',
  },
  {
    name: 'Professional Behaviour',
    category: 'PIL',
    created: '12 / 04 / 2025',
  },
  {
    name: 'Whistleblower Policy',
    category: 'HIPAA',
    created: '11 / 03 / 2025',
  },
  { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
  { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
  { name: 'Performance Appraisal', category: 'PIL', created: '12 / 04 / 2024' },
  { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
];

@Component({
  selector: 'app-resourceeditdpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    NgFor,
  ],
  templateUrl: './resourceeditdpopup.component.html',
  styleUrls: ['./resourceeditdpopup.component.css'],
})
export class ResourceeditdpopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<ResourceeditdpopupComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayedColumns: string[] = ['name', 'category', 'created'];

  dataSource = new MatTableDataSource<Folder>(FOLDER_DATA);

  selection = new SelectionModel<Folder>(true, []);

  types: string[] = [];
  selectedType: string = '';
  searchValue: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    // create category dropdown
    this.types = [...new Set(FOLDER_DATA.map((x) => x.category))];

    // advanced filter logic
    this.dataSource.filterPredicate = (data: Folder, filter: string) => {
      const filterData = JSON.parse(filter);

      const searchMatch =
        data.name.toLowerCase().includes(filterData.search) ||
        data.category.toLowerCase().includes(filterData.search) ||
        data.created.toLowerCase().includes(filterData.search);

      const categoryMatch =
        !filterData.category || data.category === filterData.category;

      return searchMatch && categoryMatch;
    };

    this.applyFilter();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event?: Event) {
    if (event) {
      this.searchValue = (event.target as HTMLInputElement).value
        .trim()
        .toLowerCase();
    }

    const filterValue = {
      search: this.searchValue,
      category: this.selectedType,
    };

    this.dataSource.filter = JSON.stringify(filterValue);

    // clear selection when filter changes
    this.selection.clear();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;

    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }

  closeDialog() {
    this.dialogRef.close(this.selection.selected);
  }
}
