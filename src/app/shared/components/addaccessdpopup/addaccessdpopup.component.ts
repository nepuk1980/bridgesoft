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
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { IdentityVaultCategoryResponse } from '../../../models/type';

export interface FileFolderItem {
  id: string | number;
  name: string;
  category: string;
  created: string;
  totalHitCount: number;
  folderFileSize: string;
  classification: string;
}

@Component({
  selector: 'app-addaccessdpopup',
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
    MatSnackBarModule,
    NgFor,
    NgIf,
    DatePipe,
  ],
  templateUrl: './addaccessdpopup.component.html',
  styleUrl: './addaccessdpopup.component.css',
})
export class AddaccessdpopupComponent implements AfterViewInit, OnInit {
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AddaccessdpopupComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayedColumns: string[] = ['name', 'category', 'created'];
  dataSource = new MatTableDataSource<FileFolderItem>([]);
  selection = new SelectionModel<FileFolderItem>(true, []);

  // Filter Variables
  types: IdentityVaultCategoryResponse = [];
  selectedType: string = '';
  searchValue: string = '';

  selectedItemFilter: string = '';

  isFetchingData = true;
  isLoading = false;

  // 🔥 PAGINATION VARIABLES
  pageIndex = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // 🔥 SILENT PREFETCH CACHE
  private pageCache = new Map<number, FileFolderItem[]>();
  private prefetchInFlight = new Set<number>();

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.getDropdownCategories();
    this.loadData(this.pageIndex);
    console.log('get data', this.data);
  }

  ngAfterViewInit() {
    // 🔥 FIXED: Added null check to prevent TypeError before sort is initialized
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
        this.sortDataLocal(sortState);
      });
    } else {
      console.warn('MatSort is not initialized yet.');
    }
  }

  getDropdownCategories() {
    // 🔥 FIXED: Called 'getcategories' (lowercase 'c') to match your service precisely
    this.api.getcategories('identityvault').subscribe({
      next: (res: IdentityVaultCategoryResponse) => {
        this.types = res || [];
      },
      error: (err) => {
        console.error('Failed to load filter categories', err);
      },
    });

    console.log('types', this.types);
  }

  // 🔥 MAIN DATA LOADER
  loadData(pageToLoad: number) {
    if (this.pageCache.has(pageToLoad)) {
      console.log(
        `[Silent Log] Loading Page ${pageToLoad + 1} instantly from cache.`,
      );
      this.dataSource.data = this.pageCache.get(pageToLoad)!;
      this.generatePages();
      this.triggerSilentPrefetch(pageToLoad);
      return;
    }

    this.isFetchingData = true;

    this.api
      .getAllFilesAndFoldersDetails(
        this.searchValue,
        this.selectedItemFilter,

        this.selectedType,
        pageToLoad,
        this.pageSize,
      )
      .subscribe({
        next: (res: any) => {
          const items =
            res.content || res.data || (Array.isArray(res) ? res : []);

          const mappedItems = items.map((item: any) => ({
            id: item.id,
            name: item.itemName || 'Unnamed Item',
            category: item.category || 'General',
            created: item.createDatetime,
            totalHitCount: item.folderFileHitCount || 0,
            folderFileSize: item.folderFileSize || '',
            classification: item.category || 'General',
          }));

          this.pageCache.set(pageToLoad, mappedItems);
          this.dataSource.data = mappedItems;

          this.totalElements = res.totalElements || mappedItems.length;
          this.totalPages =
            res.totalPages || Math.ceil(this.totalElements / this.pageSize);

          this.generatePages();
          this.isFetchingData = false;

          this.triggerSilentPrefetch(pageToLoad);
        },
        error: (err) => {
          console.error('Failed to load files and folders', err);
          this.isFetchingData = false;
        },
      });
  }

  // 🔥 SILENT PREFETCH LOGIC
  triggerSilentPrefetch(currentPage: number) {
    this.executeSilentPrefetch(currentPage + 1);
    this.executeSilentPrefetch(currentPage + 2);
  }

  executeSilentPrefetch(pageToPrefetch: number) {
    if (this.totalPages > 0 && pageToPrefetch >= this.totalPages) return;
    if (
      this.pageCache.has(pageToPrefetch) ||
      this.prefetchInFlight.has(pageToPrefetch)
    )
      return;

    this.prefetchInFlight.add(pageToPrefetch);

    this.api
      .getAllFilesAndFoldersDetails(
        this.searchValue,
        this.selectedType,
        this.selectedItemFilter,
        pageToPrefetch,
        this.pageSize,
      )
      .subscribe({
        next: (res: any) => {
          const items =
            res.content || res.data || (Array.isArray(res) ? res : []);
          const mappedItems = items.map((item: any) => ({
            id: item.id,
            name: item.itemName || 'Unnamed Item',
            category: item.category || 'General',
            created: item.createDatetime,
            totalHitCount: item.folderFileHitCount || 0,
            folderFileSize: item.folderFileSize || '',
            classification: item.category || 'General',
          }));

          this.pageCache.set(pageToPrefetch, mappedItems);
          this.prefetchInFlight.delete(pageToPrefetch);
        },
        error: (err) => {
          console.error(
            `[Silent Log] Failed to prefetch Page ${pageToPrefetch + 1}`,
            err,
          );
          this.prefetchInFlight.delete(pageToPrefetch);
        },
      });
  }

  // --- PAGINATION CONTROLS ---

  generatePages(): void {
    if (!this.totalPages) {
      this.pages = [];
      return;
    }
    const visiblePages = 3;
    let start = Math.max(1, this.pageIndex + 1 - Math.floor(visiblePages / 2));
    let end = start + visiblePages - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - visiblePages + 1);
    }
    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  goToPage = (p: number) => {
    if (p !== this.pageIndex + 1 && !this.isFetchingData) {
      this.pageIndex = p - 1;
      this.loadData(this.pageIndex);
    }
  };

  nextPage = () => {
    if (this.pageIndex < this.totalPages - 1 && !this.isFetchingData) {
      this.pageIndex++;
      this.loadData(this.pageIndex);
    }
  };

  prevPage = () => {
    if (this.pageIndex > 0 && !this.isFetchingData) {
      this.pageIndex--;
      this.loadData(this.pageIndex);
    }
  };

  firstPage = () => {
    if (this.pageIndex !== 0 && !this.isFetchingData) {
      this.pageIndex = 0;
      this.loadData(this.pageIndex);
    }
  };

  lastPage = () => {
    if (
      this.totalPages > 0 &&
      this.pageIndex !== this.totalPages - 1 &&
      !this.isFetchingData
    ) {
      this.pageIndex = this.totalPages - 1;
      this.loadData(this.pageIndex);
    }
  };

  // --- FILTERING & SORTING ---

  applyBackendFilter(event?: Event) {
    if (event) {
      this.searchValue = (event.target as HTMLInputElement).value.trim();
    }
    this.pageCache.clear();
    this.prefetchInFlight.clear();
    this.pageIndex = 0;
    this.loadData(0);
  }

  sortDataLocal(sortState: Sort) {
    const data = this.dataSource.data.slice();
    if (!sortState.active || sortState.direction === '') {
      this.dataSource.data = data;
    } else {
      this.dataSource.data = data.sort((a, b) => {
        const isAsc = sortState.direction === 'asc';
        switch (sortState.active) {
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'category':
            return this.compare(a.category, b.category, isAsc);
          case 'created':
            return this.compare(
              new Date(a.created).getTime(),
              new Date(b.created).getTime(),
              isAsc,
            );
          default:
            return 0;
        }
      });
    }
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // --- SELECTION & SUBMISSION ---

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  onSubmit() {
    const selectedItems = this.selection.selected;

    if (selectedItems.length === 0) return;

    const hasGroup = !!this.data?.group?.id;
    const hasUser = !!this.data?.user?.id;

    if (!hasGroup && !hasUser) {
      this.showMessage('Error: No active group or user selected.');
      return;
    }

    this.isLoading = true;

    const payload = selectedItems.map((item) => ({
      groupId: hasGroup ? this.data.group.id.toString() : '',
      groupName: hasGroup
        ? this.data.group.groupName || this.data.group.name
        : '',
      folderId: item.id.toString(),
      folderName: item.name,
      userId: this.data.user.id || '',
      userName: this.data.user.name || '',
      fileSystemPermissions: 'Full Control',
      totalHitCount: item.totalHitCount?.toString() || '0',
      folderFileSize: item.folderFileSize || '',
      classification: item.classification || 'General',
      accessAction: 'Add',
      status: 'New',
    }));

    console.log('access', payload);

    this.api.addfolderorfiletothegrouporuser(payload).subscribe({
      next: () => {
        this.showMessage('Access added successfully');
        setTimeout(() => {
          this.isLoading = false;
          this.dialogRef.close(true);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Failed to add access:', err);
        this.showMessage('Failed to add access');
        this.isLoading = false;
      },
    });
  }

  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
