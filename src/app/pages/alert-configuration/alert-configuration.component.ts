import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { Subject, forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

interface TreeNode {
  name: string;
  type: 'department' | 'user' | 'directory';
  children?: TreeNode[];
  selected?: boolean;
}

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
    RouterLink,
  ],
  templateUrl: './alert-configuration.component.html',
  styleUrl: './alert-configuration.component.css',
})
export class AlertConfigurationComponent implements OnInit {
  /* ---------- FORM STATE VARIABLES ---------- */
  alertSummary: string = '';
  alertDescription: string = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  selectedTime: any = null;
  recipientEmail: string = '';

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

  /* ---------- AD GROUP PAGINATION STATE ---------- */
  groupPage = 0;
  groupSize = 50;
  groupNameFilter = '';

  /* ---------- RESOURCES STATE ---------- */
  itemName: string[] = [];
  filteredItemNames: string[] = [];
  page = 0;
  size = 50;
  totalElements = 0;
  loadingResources = false;
  searchText = '';
  private searchSubject = new Subject<string>();

  /* ---------- DIRECTORY VAULT (TREES) STATE ---------- */
  treePage = 0;
  treeSize = 50;
  hasMoreTreeElements = true;
  loadingTreeData = false;

  includeSearchText: string = '';
  excludeSearchText: string = '';

  private allCompiledGroupData: any[] = [];

  private filteredMasterIncludeGroups: TreeNode[] = [];
  private filteredMasterIncludeUsers: TreeNode[] = [];
  private filteredMasterIncludeAccess: TreeNode[] = [];
  private filteredMasterExcludeGroups: TreeNode[] = [];
  private filteredMasterExcludeUsers: TreeNode[] = [];
  private filteredMasterExcludeAccess: TreeNode[] = [];

  /* ---------- MISC OPTIONS CONTROLS ---------- */
  isCheckedWebAlert = false;
  isCheckedEmailAlert = false;
  isCheckedAllTheTime = false;
  selectedTimezone = 'GMT';

  days = [
    { label: 'S', value: 'Sunday' },
    { label: 'M', value: 'Monday' },
    { label: 'T', value: 'Tuesday' },
    { label: 'W', value: 'Wednesday' },
    { label: 'T', value: 'Thursday' },
    { label: 'F', value: 'Friday' },
    { label: 'S', value: 'Saturday' },
  ];
  selectedDays: string[] = [];

  editingAlertId: number | null = null;
  mode: 'create' | 'edit' | 'copy' = 'create';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    const state = history.state;

    if (state?.mode) {
      this.mode = state.mode;
    }

    if (state?.alertData) {
      this.populateForm(state.alertData);
    }
  }
  private treesLoadedSubject = new Subject<void>();
  populateForm(data: any) {
    if (!data) return;

    this.editingAlertId = this.mode === 'edit' ? data.id : null;
    this.alertSummary = data.alertName || '';
    this.alertDescription = data.alertDesc || '';
    this.selecteAccessFolder = data.whenSomeone || 'Add Access Folder';
    this.itemType = data.alertAction === 'Remove' ? 'Folder' : 'File';
    this.selectedResources = data.alertResources?.split(',') || [];

    this.isCheckedAllTheTime = data.allTheTime ?? false;
    this.dateFrom = data.fromDate ? new Date(data.fromDate) : null;
    this.dateTo = data.toDate ? new Date(data.toDate) : null;
    this.selectedTime = data.alertTime ? new Date(data.alertTime) : null;
    this.selectedTimezone = data.timeZone || 'GMT';

    this.isCheckedWebAlert = data.alertMode === 'Web Alert';
    this.isCheckedEmailAlert = !this.isCheckedWebAlert;
    this.recipientEmail = data.alertEmail || '';

    const dayMap: { [key: string]: string } = {
      sun: 'Sunday',
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
    };

    if (data.days) {
      this.selectedDays = data.days.split(',').map((d: string) => d.trim());
    } else {
      this.selectedDays = [];
    }
  }

  private selectNodesFromList(names: string[], nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (names.includes(node.name)) {
        node.selected = true;
      }
      if (node.children) this.selectNodesFromList(names, node.children);
    });
  }

  ngOnInit(): void {
    this.fetchAllUsersByGroup();
    this.getADGroup();
    this.getResources();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.resetAndFetchWithSearch();
      });

    // 1. Fetch metadata first (Updated with new API signature)
    forkJoin({
      groups: this.api.getadgroups(
        this.groupNameFilter,
        this.groupPage,
        this.groupSize,
      ),
      vaults: this.api.getlistofidentityvaults(0, 50, '', ''),
    }).subscribe({
      next: () => {
        this.fetchAllUsersByGroup();
        this.getResources();

        // 2. Once done, trigger the signal that trees are ready
        this.treesLoadedSubject.next();
      },
    });

    // 3. Listen for the signal to populate the form
    this.treesLoadedSubject.subscribe(() => {
      const state = history.state;
      if (state?.alertData) {
        this.populateForm(state.alertData);
      }
    });
  }

  getADGroup(): void {
    this.api
      .getadgroups(this.groupNameFilter, this.groupPage, this.groupSize)
      .subscribe({
        next: (res: any) => {
          const groupsRaw = Array.isArray(res)
            ? res
            : res.content || res.data || [];
          this.groupNames = groupsRaw.map((item: any) => item.groupName);
        },
        error: (err) => console.error('Failed fetching AD groups:', err),
      });
  }

  fetchAllUsersByGroup(): void {
    if (this.loadingTreeData) return;
    this.loadingTreeData = true;

    this.api
      .getadgroups(this.groupNameFilter, this.groupPage, this.groupSize)
      .pipe(
        switchMap((res: any) => {
          const groups = Array.isArray(res)
            ? res
            : res.content || res.data || [];

          if (!groups || !groups.length) {
            this.hasMoreTreeElements = false;
            return [[]];
          }

          const detailRequests: Observable<any>[] = groups.map((group: any) => {
            const currentGroupName = group.groupName?.toLowerCase().trim();

            return this.api
              .getlistofidentityvaults(this.treePage, this.treeSize, '', '')
              .pipe(
                map((vaultRes: any) => {
                  const vaultUsers = vaultRes?.content || [];
                  const totalVaultElements = vaultRes?.totalElements || 0;

                  if (
                    (this.treePage + 1) * this.treeSize >=
                    totalVaultElements
                  ) {
                    this.hasMoreTreeElements = false;
                  }

                  const uniqueUserNames = [
                    ...new Set(
                      vaultUsers
                        .filter((user: any) => {
                          const deptStr = (user.department || '')
                            .toLowerCase()
                            .trim();
                          const groupsStr = (user.groupsList || '')
                            .toLowerCase()
                            .trim();
                          return (
                            deptStr === currentGroupName ||
                            groupsStr.includes(currentGroupName)
                          );
                        })
                        .map((user: any) =>
                          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        )
                        .filter((fullName: string) => fullName.length > 0),
                    ),
                  ];

                  return {
                    groupName: group.groupName,
                    users: uniqueUserNames,
                  };
                }),
              );
          });

          return forkJoin(detailRequests);
        }),
      )
      .subscribe({
        next: (completeDataMap: any[]) => {
          this.allCompiledGroupData = completeDataMap;
          this.applyGroupFilter();
        },
        error: (err) => {
          console.error('Error compiling lists:', err);
          this.loadingTreeData = false;
        },
      });
  }

  onWhenSomeoneChange(selectedValue: string): void {
    this.selecteAccessFolder = selectedValue;
  }

  filterIncludeTree(): void {
    const search = this.includeSearchText.toLowerCase().trim();

    if (!search) {
      this.includeDataSource.data = this.deepCloneTree(
        this.filteredMasterIncludeGroups,
      );
    } else {
      this.includeDataSource.data = this.performNestedTreeFilter(
        this.filteredMasterIncludeGroups,
        search,
      );
      this.expandAllTreeNodes(
        this.includeDataSource.data,
        this.includeTreeControl,
      );
    }

    this.includeUsersDataSource.data = this.filteredMasterIncludeUsers.filter(
      (node) => node.name.toLowerCase().includes(search),
    );

    this.includeAccessDataSource.data = this.filteredMasterIncludeAccess.filter(
      (node) => node.name.toLowerCase().includes(search),
    );

    this.cdr.detectChanges();
  }

  filterExcludeTree(): void {
    const search = this.excludeSearchText.toLowerCase().trim();

    if (!search) {
      this.excludeDataSource.data = this.deepCloneTree(
        this.filteredMasterExcludeGroups,
      );
    } else {
      this.excludeDataSource.data = this.performNestedTreeFilter(
        this.filteredMasterExcludeGroups,
        search,
      );
      this.expandAllTreeNodes(
        this.excludeDataSource.data,
        this.excludeTreeControl,
      );
    }

    this.excludeUsersDataSource.data = this.filteredMasterExcludeUsers.filter(
      (node) => node.name.toLowerCase().includes(search),
    );

    this.excludeAccessDataSource.data = this.filteredMasterExcludeAccess.filter(
      (node) => node.name.toLowerCase().includes(search),
    );

    this.cdr.detectChanges();
  }

  private performNestedTreeFilter(
    nodes: TreeNode[],
    search: string,
  ): TreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: node.children ? [...node.children] : undefined,
      }))
      .filter((node) => {
        const nameMatches = node.name.toLowerCase().includes(search);

        if (node.type === 'department' && nameMatches) {
          return true;
        }

        if (node.children && node.children.length > 0) {
          node.children = this.performNestedTreeFilter(node.children, search);
          return node.children.length > 0;
        }
        return nameMatches;
      });
  }

  private deepCloneTree(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => ({
      ...node,
      children: node.children ? this.deepCloneTree(node.children) : undefined,
    }));
  }

  private expandAllTreeNodes(
    nodes: TreeNode[],
    control: NestedTreeControl<TreeNode>,
  ): void {
    nodes.forEach((node) => {
      control.expand(node);
      if (node.children) {
        this.expandAllTreeNodes(node.children, control);
      }
    });
  }

  private mergeOrAddGroupNode(targetTree: TreeNode[], newNode: TreeNode): void {
    const existingGroup = targetTree.find((g) => g.name === newNode.name);
    if (existingGroup) {
      if (newNode.children) {
        existingGroup.children = existingGroup.children || [];
        newNode.children.forEach((newChild) => {
          if (!existingGroup.children!.some((c) => c.name === newChild.name)) {
            existingGroup.children!.push(newChild);
          }
        });
      }
    } else {
      targetTree.push(newNode);
    }
  }

  loadMoreTreeData(): void {
    if (!this.hasMoreTreeElements || this.loadingTreeData) return;
    this.treePage++;
    this.fetchAllUsersByGroup();
  }

  /* ---------- CHECKBOX SELECTION CASCADE LOGIC ---------- */
  toggleParentSelection(node: TreeNode, checked: boolean): void {
    node.selected = checked;

    if (node.children) {
      node.children.forEach((child) => {
        this.toggleParentSelection(child, checked);
      });
    }

    this.cdr.detectChanges();
  }

  checkParentSelectionRules(node: TreeNode, dataSourceData: TreeNode[]): void {
    const parentNode = this.getParentNode(node, dataSourceData);
    if (!parentNode || !parentNode.children) return;

    parentNode.selected = parentNode.children.every((child) => child.selected);
    this.cdr.detectChanges();

    this.checkParentSelectionRules(parentNode, dataSourceData);
  }

  getParentNode(targetNode: TreeNode, nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      if (
        node.children &&
        node.children.some((child) => child === targetNode)
      ) {
        return node;
      } else if (node.children) {
        const parent = this.getParentNode(targetNode, node.children);
        if (parent) return parent;
      }
    }
    return null;
  }

  descendantsPartiallySelected(node: TreeNode): boolean {
    if (!node.children || !node.children.length) return false;
    const allChecked = node.children.every((child) => child.selected);
    const someChecked = node.children.some(
      (child) => child.selected || this.descendantsPartiallySelected(child),
    );
    return someChecked && !allChecked;
  }

  /* ---------- LOGICAL EXTRACTOR FOR DATA SUBMISSION ---------- */
  private getSelectedNodes(nodes: TreeNode[]): any[] {
    let selected: any[] = [];
    nodes.forEach((node) => {
      if (node.selected) {
        selected.push({ name: node.name, type: node.type });
      }
      if (node.children && node.children.length > 0) {
        selected = [...selected, ...this.getSelectedNodes(node.children)];
      }
    });
    return selected;
  }

  /* ---------- SAVE ACTION METRIC LOGGING ---------- */
  applyGroupFilter(): void {
    const currentGroupsInclude: TreeNode[] = [];
    const currentGroupsExclude: TreeNode[] = [];
    const currentUsersInclude: TreeNode[] = [];
    const currentUsersExclude: TreeNode[] = [];
    const currentAccessInclude: TreeNode[] = [];
    const currentAccessExclude: TreeNode[] = [];

    this.allCompiledGroupData.forEach((item) => {
      const createGroupNode = (): TreeNode => ({
        name: item.groupName,
        type: 'department',
        selected: false,
        children: item.users.map((userName: string) => ({
          name: userName,
          type: 'user',
          selected: false,
        })),
      });

      this.mergeOrAddGroupNode(currentGroupsInclude, createGroupNode());
      this.mergeOrAddGroupNode(currentGroupsExclude, createGroupNode());

      item.users.forEach((userName: string) => {
        if (!currentUsersInclude.some((u) => u.name === userName)) {
          currentUsersInclude.push({
            name: userName,
            type: 'user',
            selected: false,
          });
        }
        if (!currentUsersExclude.some((u) => u.name === userName)) {
          currentUsersExclude.push({
            name: userName,
            type: 'user',
            selected: false,
          });
        }
      });

      if (!currentAccessInclude.some((a) => a.name === item.groupName)) {
        currentAccessInclude.push({
          name: item.groupName,
          type: 'directory',
          selected: false,
        });
      }
      if (!currentAccessExclude.some((a) => a.name === item.groupName)) {
        currentAccessExclude.push({
          name: item.groupName,
          type: 'directory',
          selected: false,
        });
      }
    });

    this.filteredMasterIncludeGroups = currentGroupsInclude;
    this.filteredMasterIncludeUsers = currentUsersInclude;
    this.filteredMasterIncludeAccess = currentAccessInclude;

    this.filteredMasterExcludeGroups = currentGroupsExclude;
    this.filteredMasterExcludeUsers = currentUsersExclude;
    this.filteredMasterExcludeAccess = currentAccessExclude;

    this.filterIncludeTree();
    this.filterExcludeTree();

    this.loadingTreeData = false;
    this.cdr.detectChanges();
  }

  /* ---------- SAVE ACTION METRIC LOGGING ---------- */
  saveAlert(): void {
    const getSelectedByType = (
      data: TreeNode[],
      type: 'department' | 'user' | 'directory',
    ): string => {
      const names: string[] = [];
      const traverse = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
          if (node.selected && node.type === type) {
            names.push(node.name);
          }
          if (node.children) {
            traverse(node.children);
          }
        });
      };
      traverse(data);
      return [...new Set(names)].join(',');
    };

    const payload: any = {
      alertName: this.alertSummary,
      alertDesc: this.alertDescription,
      whenSomeone: this.selecteAccessFolder,
      alertAction: this.itemType,
      alertResources: this.selectedResources.join(','),

      includeGroups: getSelectedByType(
        this.includeDataSource.data,
        'department',
      ),
      includeUsers: getSelectedByType(this.includeDataSource.data, 'user'),
      includeResources: this.selectedResources.join(','),

      excludeGroups: getSelectedByType(
        this.excludeDataSource.data,
        'department',
      ),
      excludeUsers: getSelectedByType(this.excludeDataSource.data, 'user'),
      excludeResources: this.selectedResources.join(','),

      allTheTime: this.isCheckedAllTheTime,
      fromDate: this.dateFrom ? this.dateFrom.toISOString() : '',
      toDate: this.dateTo ? this.dateTo.toISOString() : '',
      days: this.selectedDays.join(','),
      timeZone: this.selectedTimezone,
      alertTime: this.selectedTime
        ? new Date(this.selectedTime).toISOString()
        : '',
      alertMode: this.isCheckedWebAlert ? 'Web Alert' : 'Email Alert',
      alertEmail: this.isCheckedEmailAlert ? this.recipientEmail : '',
    };

    if (this.mode === 'edit') {
      payload.id = this.editingAlertId;
    }

    if (this.mode === 'edit') {
      this.api.updateAlertDetails(payload).subscribe({
        next: () => {
          this.showMessage('Alert updated successfully');
          this.router.navigate(['/alerts']);
        },
        error: () => this.showMessage('Error updating alert'),
      });
    } else {
      this.api.saveAlertDetails(payload).subscribe({
        next: () => {
          this.showMessage('Alert saved successfully');
          this.router.navigate(['/alerts']);
        },
        error: () => this.showMessage('Error saving alert'),
      });
    }
  }

  private getSelectedTreeNames(nodes: TreeNode[]): string {
    let names: string[] = [];
    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach((node) => {
        if (node.selected) names.push(node.name);
        if (node.children) traverse(node.children);
      });
    };
    traverse(nodes);
    return [...new Set(names)].join(',');
  }

  /* ---------- RESOURCES ---------- */
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
        },
        error: (err) => {
          console.error('Failed fetching data stream resources:', err);
          this.loadingResources = false;
        },
      });
  }

  filterResources(): void {
    this.searchSubject.next(this.searchText);
  }

  resetAndFetchWithSearch(): void {
    this.page = 0;
    this.itemName = [];
    this.filteredItemNames = [];
    this.getResources();
  }

  onItemTypeChange(type: 'File' | 'Folder'): void {
    if (this.itemType === type) return;
    this.itemType = type;
    this.searchText = '';
    this.selectedResources = [];
    this.resetAndFetchWithSearch();
  }

  hasChild = (_: number, node: TreeNode) => node.type === 'department';

  selectNode(node: TreeNode, side: 'include' | 'exclude') {
    if (side === 'include') this.selectedIncludeNode = node;
    if (side === 'exclude') this.selectedExcludeNode = node;
  }

  onTabChange(event: MatTabChangeEvent) {}

  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
  }
  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }
}
