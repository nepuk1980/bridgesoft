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

export interface Folder {
  id: string | number;
  name: string;
  category: string;
  created: string;
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
  dataSource = new MatTableDataSource<Folder>([]);
  selection = new SelectionModel<Folder>(true, []);

  types: string[] = ['PIL', 'HIPAA', 'General', 'Cloud Resources'];
  selectedType: string = '';
  searchValue: string = '';

  isFetchingFolders = true;
  isLoading = false;

  // 🔥 PAGINATION VARIABLES
  pageIndex = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // 🔥 SILENT PREFETCH CACHE
  private pageCache = new Map<number, Folder[]>();
  private prefetchInFlight = new Set<number>();

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadFolders(this.pageIndex);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.sortDataLocal(sortState);
    });
  }

  // 🔥 MAIN DATA LOADER
  loadFolders(pageToLoad: number) {
    // 1. If data is already silently cached, use it instantly!
    if (this.pageCache.has(pageToLoad)) {
      console.log(
        `[Silent Log] Loading Page ${pageToLoad + 1} instantly from cache.`,
      );
      this.dataSource.data = this.pageCache.get(pageToLoad)!;
      this.generatePages();
      this.triggerSilentPrefetch(pageToLoad); // Fetch next pages
      return;
    }

    // 2. If not cached, show spinner and call API
    this.isFetchingFolders = true;
    console.log(
      `[Silent Log] API Fetching Page ${pageToLoad + 1} with Spinner.`,
    );

    this.api.getAllFolders(pageToLoad, this.pageSize).subscribe({
      next: (res: any) => {
        const folders =
          res.content || res.data || (Array.isArray(res) ? res : []);

        const mappedFolders = folders.map((f: any) => ({
          id: f.id,
          name: f.itemName || 'Unnamed Folder',
          category: f.category || 'General',
          created: f.createDatetime,
        }));

        // Save to cache and UI
        this.pageCache.set(pageToLoad, mappedFolders);
        this.dataSource.data = mappedFolders;

        // Update pagination totals
        this.totalElements = res.totalElements || mappedFolders.length;
        this.totalPages =
          res.totalPages || Math.ceil(this.totalElements / this.pageSize);

        this.generatePages();
        this.isFetchingFolders = false;

        // 3. Trigger silent prefetch for next 2 pages
        this.triggerSilentPrefetch(pageToLoad);
      },
      error: (err) => {
        console.error('Failed to load folders', err);
        this.isFetchingFolders = false;
      },
    });
  }

  // 🔥 SILENT PREFETCH LOGIC
  triggerSilentPrefetch(currentPage: number) {
    this.executeSilentPrefetch(currentPage + 1); // Prefetch Next Page
    this.executeSilentPrefetch(currentPage + 2); // Prefetch Page After Next
  }

  executeSilentPrefetch(pageToPrefetch: number) {
    // Don't prefetch if it exceeds total pages, is already cached, or is currently fetching
    if (this.totalPages > 0 && pageToPrefetch >= this.totalPages) return;
    if (
      this.pageCache.has(pageToPrefetch) ||
      this.prefetchInFlight.has(pageToPrefetch)
    )
      return;

    this.prefetchInFlight.add(pageToPrefetch);
    console.log(
      `[Silent Log] Silently prefetching Page ${pageToPrefetch + 1} in background...`,
    );

    // Call API WITHOUT triggering `isFetchingFolders` (so no spinner shows)
    this.api.getAllFolders(pageToPrefetch, this.pageSize).subscribe({
      next: (res: any) => {
        const folders =
          res.content || res.data || (Array.isArray(res) ? res : []);
        const mappedFolders = folders.map((f: any) => ({
          id: f.id,
          name: f.itemName || 'Unnamed Folder',
          category: f.category || 'General',
          created: f.createDatetime,
        }));

        // Store quietly in cache
        this.pageCache.set(pageToPrefetch, mappedFolders);
        this.prefetchInFlight.delete(pageToPrefetch);
        console.log(
          `[Silent Log] ✅ Page ${pageToPrefetch + 1} successfully cached in background.`,
        );
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
    if (p !== this.pageIndex + 1 && !this.isFetchingFolders) {
      this.pageIndex = p - 1;
      this.loadFolders(this.pageIndex);
    }
  };

  nextPage = () => {
    if (this.pageIndex < this.totalPages - 1 && !this.isFetchingFolders) {
      this.pageIndex++;
      this.loadFolders(this.pageIndex);
    }
  };

  prevPage = () => {
    if (this.pageIndex > 0 && !this.isFetchingFolders) {
      this.pageIndex--;
      this.loadFolders(this.pageIndex);
    }
  };

  firstPage = () => {
    if (this.pageIndex !== 0 && !this.isFetchingFolders) {
      this.pageIndex = 0;
      this.loadFolders(this.pageIndex);
    }
  };

  lastPage = () => {
    if (
      this.totalPages > 0 &&
      this.pageIndex !== this.totalPages - 1 &&
      !this.isFetchingFolders
    ) {
      this.pageIndex = this.totalPages - 1;
      this.loadFolders(this.pageIndex);
    }
  };

  // --- FILTERING & SORTING ---

  applyFilter(event?: Event) {
    if (event) {
      this.searchValue = (event.target as HTMLInputElement).value
        .trim()
        .toLowerCase();
    }

    // 🔥 CLEAR CACHE ON SEARCH: If the user searches, the old cached pages are no longer valid!
    this.pageCache.clear();
    this.prefetchInFlight.clear();
    this.pageIndex = 0;

    // Note: For true backend search, pass this.searchValue into your API here
    // this.loadFolders(0);

    const filterValue = {
      search: this.searchValue,
      category: this.selectedType,
    };

    this.dataSource.filterPredicate = (
      data: Folder,
      filter: string,
    ): boolean => {
      const filterData = JSON.parse(filter);
      const searchMatch =
        data.name.toLowerCase().includes(filterData.search) ||
        (data.category
          ? data.category.toLowerCase().includes(filterData.search)
          : false);
      const categoryMatch =
        !filterData.category || data.category === filterData.category;
      return !!(searchMatch && categoryMatch);
    };

    this.dataSource.filter = JSON.stringify(filterValue);
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
    const selectedFolders = this.selection.selected;

    if (selectedFolders.length === 0) return;

    if (!this.data?.group?.id) {
      this.showMessage('Error: No active group selected.');
      return;
    }

    this.isLoading = true;

    const payload = selectedFolders.map((folder) => ({
      groupId: this.data.group.id.toString(),
      groupName: this.data.group.name,
      folderId: folder.id.toString(),
      folderName: folder.name,
      status: 'New',
    }));

    this.api.addFolderToGroup(payload).subscribe({
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
