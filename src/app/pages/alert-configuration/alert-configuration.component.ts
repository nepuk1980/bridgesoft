import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Imported ChangeDetectorRef
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ApiService } from '../../services/api.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface TreeNode {
  name: string;
  type: 'department' | 'user' | 'directory';
  children?: TreeNode[];
  filter?: 'Include' | 'Exclude';
}

const GROUP_TREE: TreeNode[] = [
  {
    name: 'Human Resources',
    type: 'department',
    filter: 'Include',
    children: [
      { name: 'Christopher Williams', type: 'user' },
      { name: 'Melinda Kite', type: 'user' },
    ],
  },
  {
    name: 'Administration',
    type: 'department',
    filter: 'Exclude',
    children: [
      { name: 'Christopher Williams', type: 'user' },
      { name: 'Melinda Kite', type: 'user' },
    ],
  },
];

@Component({
  selector: 'app-alert-configuration',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    InnerheaderComponent,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatTreeModule,
    MatIconModule,
    NgIf,
    NgFor,
    NgClass,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
  ],
  templateUrl: './alert-configuration.component.html',
  styleUrl: './alert-configuration.component.css',
})
export class AlertConfigurationComponent implements OnInit {
  /* ---------- ACTIVE STATES ---------- */
  selectedIncludeNode: TreeNode | null = null;
  selectedExcludeNode: TreeNode | null = null;

  /* ---------- TREE CONTROLS ---------- */
  includeTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  excludeTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  usersTreeControl = new NestedTreeControl<TreeNode>(() => []);
  accessTreeControl = new NestedTreeControl<TreeNode>(() => []);

  /* ---------- DATA SOURCES ---------- */
  includeDataSource = new MatTreeNestedDataSource<TreeNode>();
  excludeDataSource = new MatTreeNestedDataSource<TreeNode>();
  includeUsersDataSource = new MatTreeNestedDataSource<TreeNode>();
  excludeUsersDataSource = new MatTreeNestedDataSource<TreeNode>();
  includeAccessDataSource = new MatTreeNestedDataSource<TreeNode>();
  excludeAccessDataSource = new MatTreeNestedDataSource<TreeNode>();

  /* ---------- FORM SELECTION CONTROLS ---------- */
  groupNames: string[] = [];
  itemType: 'File' | 'Folder' = 'File';
  selecteAccessFolder: string = '';
  selectedResources: string[] = [];

  /* ---------- API PAGINATION & SERVER SEARCH STATE ---------- */
  itemName: string[] = [];
  filteredItemNames: string[] = [];
  page = 0;
  size = 50; // Increased size slightly to guarantee matching content per batch sequence
  totalElements = 0;
  loadingResources = false;
  searchText = '';
  private searchSubject = new Subject<string>();

  /* ---------- MISC OPTIONS CONTROLS ---------- */
  isCheckedWebAlert = false;
  isCheckedEmailAlert = false;
  isCheckedAllTheTime = false;
  selectedTimezone = 'GMT';

  days = [
    { label: 'S', value: 'sun' },
    { label: 'M', value: 'mon' },
    { label: 'T', value: 'tue' },
    { label: 'W', value: 'wed' },
    { label: 'T', value: 'thu' },
    { label: 'F', value: 'fri' },
    { label: 'S', value: 'sat' },
  ];
  selectedDays: string[] = [];

  // 2. Injected ChangeDetectorRef directly into the constructor
  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    const includeGroups = GROUP_TREE.filter((g) => g.filter === 'Include');
    const excludeGroups = GROUP_TREE.filter((g) => g.filter === 'Exclude');

    this.includeDataSource.data = includeGroups;
    this.excludeDataSource.data = excludeGroups;

    const includeUsers = includeGroups.flatMap((g) => g.children ?? []);
    const excludeUsers = excludeGroups.flatMap((g) => g.children ?? []);

    this.includeUsersDataSource.data = includeUsers;
    this.excludeUsersDataSource.data = excludeUsers;

    this.includeAccessDataSource.data = includeGroups.map((g) => ({
      name: g.name,
      type: 'directory',
    }));
    this.excludeAccessDataSource.data = excludeGroups.map((g) => ({
      name: g.name,
      type: 'directory',
    }));

    if (includeGroups.length) {
      this.includeTreeControl.expand(includeGroups[0]);
      this.selectedIncludeNode = includeGroups[0];
    }
    if (excludeGroups.length) {
      this.excludeTreeControl.expand(excludeGroups[0]);
      this.selectedExcludeNode = excludeGroups[0];
    }
  }

  ngOnInit(): void {
    this.getADGroup();
    this.getResources();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.resetAndFetchWithSearch();
      });
  }

  getADGroup(): void {
    this.api.getadgroups().subscribe({
      next: (res) => {
        this.groupNames = res.map((item) => item.groupName);
      },
    });
  }

  getResources(): void {
    if (this.loadingResources) return;
    this.loadingResources = true;

    this.api
      .getAllFilesAndFoldersDetails(
        this.searchText,
        '',
        '',
        this.page,
        this.size,
      )
      .subscribe({
        next: (res) => {
          const content = res?.content || [];
          this.totalElements = res?.totalElements || 0;

          // 1. Filter backend records matching your chosen active layout condition
          const newItems = content
            .filter(
              (item: any) => item.itemType === this.itemType && item.itemName,
            )
            .map((item: any) => item.itemName);

          if (this.page === 0) {
            this.itemName = [...new Set(newItems)];
          } else {
            this.itemName = [...new Set([...this.itemName, ...newItems])];
          }

          this.filteredItemNames = [...this.itemName];
          this.loadingResources = false;
          this.cdr.detectChanges();

          // 2. FALLBACK AUTO-PAGING MECHANISM:
          // If we fetched a page, but the client-side filter stripped EVERYTHING away,
          // and there are still more records left on the server, automatically fetch the next page.
          const totalFetchedFromAPI = (this.page + 1) * this.size;
          if (
            this.filteredItemNames.length === 0 &&
            totalFetchedFromAPI < this.totalElements
          ) {
            this.page++;
            console.log(
              `No matching ${this.itemType}s found on page ${this.page - 1}. Auto-fetching page ${this.page}...`,
            );
            this.getResources();
          }
        },
        error: (err) => {
          console.error('Failed fetching data stream resources:', err);
          this.loadingResources = false;
        },
      });
  }

  filterResources(): void {
    this.searchSubject.next(this.searchText.trim());
  }

  private resetAndFetchWithSearch(): void {
    this.page = 0;
    this.itemName = [];
    this.filteredItemNames = [];
    this.getResources();
  }

  onDropdownOpened(opened: boolean): void {
    if (!opened) return;

    setTimeout(() => {
      // Prioritize targeting the internal viewport inside the custom wrapper selector
      let panel = document.querySelector(
        '.custom-filter-panel .mat-mdc-select-panel',
      ) as HTMLElement;

      if (!panel) {
        panel = document.querySelector('.custom-filter-panel') as HTMLElement;
      }

      if (panel) {
        panel.onscroll = null; // Unbind previous bindings safely
        panel.addEventListener(
          'scroll',
          (event: Event) => {
            this.onResourcesScroll(event);
          },
          { passive: true },
        );
      }
    }, 250); // Safe threshold allowing overlay rendering transitions to complete
  }

  onResourcesScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const currentScrollPosition = element.scrollTop + element.clientHeight;
    const scrollThresholdHeight = element.scrollHeight - 30; // 30px trigger buffer

    const hasMore = this.itemName.length < this.totalElements;

    if (
      currentScrollPosition >= scrollThresholdHeight &&
      hasMore &&
      !this.loadingResources
    ) {
      this.page++;
      this.getResources();
    }
  }

  onItemTypeChange(type: 'File' | 'Folder'): void {
    if (this.itemType === type) return;
    this.itemType = type;
    this.searchText = '';
    this.selectedResources = []; // Clears previous state strings out so binding anchors don't conflict
    this.resetAndFetchWithSearch();
  }

  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  selectNode(node: TreeNode, side: 'include' | 'exclude') {
    if (side === 'include') this.selectedIncludeNode = node;
    if (side === 'exclude') this.selectedExcludeNode = node;
  }

  onTabChange(event: MatTabChangeEvent) {
    console.log('Tab changed', event.index);
  }

  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
  }
}
