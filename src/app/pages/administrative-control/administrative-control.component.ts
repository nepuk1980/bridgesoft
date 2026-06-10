import { Component, inject, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CloudresourcespopupComponent } from '../../shared/components/cloudresourcespopup/cloudresourcespopup.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // ✅ Added SnackBar Import
import { AdduserdpopupComponent } from '../../shared/components/adduserdpopup/adduserdpopup.component';
import { AddaccessdpopupComponent } from '../../shared/components/addaccessdpopup/addaccessdpopup.component';
import { ResourceeditdpopupComponent } from '../../shared/components/resourceeditdpopup/resourceeditdpopup.component';
import { ApiService } from '../../services/api.service';

export interface SharedData {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
  tag: string;
  path: string;
}

export interface ExternalFilesData {
  name: string;
  type: string;
  serviceType: string;
  service: string;
  lastViewed: string;
  lastViewedRecent: string;
  tags: string[];
}

interface CardData {
  title: string;
  value: number | string;
  file: boolean;
  fileicon: boolean;
  icon: string;
  subtitle?: string;
}

interface TreeNode {
  id?: number | string;
  name: string;
  type:
    | 'groupList'
    | 'user'
    | 'group'
    | 'directory'
    | 'file'
    | 'folder'
    | 'loadMore';
  groupList?: string;
  children?: TreeNode[];
  userData?: any;
}

interface TableItem {
  id?: number;
  name: string;
  type: 'file' | 'folder';
  permissions: {
    F: boolean;
    M: boolean;
    R: boolean;
    W: boolean;
    X: boolean;
  };
  totalHitCount: number;
  size: string;
  classification: string | null;
  category: string | null;
  directory: string;
  directoryname: string;
}

@Component({
  selector: 'app-administrative-control',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTreeModule,
    MatIconModule,
    NgIf,
    NgFor,
    NgClass,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule, // ✅ Added to imports
  ],
  templateUrl: './administrative-control.component.html',
  styleUrl: './administrative-control.component.css',
})
export class AdministrativeControlComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar); // ✅ Injected SnackBar

  displayedColumns: string[] = [
    'directory',
    'filesystempermissions',
    'totalhitcount',
    'size',
    'classification',
    'category',
    'action',
  ];

  tableData: TableItem[] = [];
  isLoading = false;

  /** TREE CONTROLS */
  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  usersTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  usersDataSource = new MatTreeNestedDataSource<TreeNode>();

  accessTreeControl = new NestedTreeControl<TreeNode>(() => []);
  accessDataSource = new MatTreeNestedDataSource<TreeNode>();

  groupNames: string[] = [];

  leftPage = 0;
  leftSize = 10;
  hasMoreLeftData = true;
  rawIdentitiesAccumulator: any[] = [];

  accessPage = 0;
  accessSize = 10;
  hasMoreAccessData = true;
  rawAccessAccumulator: string[] = [];

  nestedUserPageSize = 10;

  pageIndex = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  private globalFileCacheRegistry = new Map<
    string,
    { rows: TableItem[]; totalElements: number; totalPages: number }
  >();
  private activeFlightFetches = new Set<string>();

  private activeNormalizedGroupName = '';

  activeTabIndex: number = 0;
  selectedNode: TreeNode | null = null;
  selectedNodeType: TreeNode['type'] | null = null;
  activeSelectedGroupNode: TreeNode | null = null;

  Shared: SharedData[] = [];
  ExternalFiles: ExternalFilesData[] = [];

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.api.getadgroups().subscribe({
      next: (res: any) => {
        const groupsRaw = Array.isArray(res)
          ? res
          : res.content || res.data || [];
        this.groupNames = groupsRaw.map((g: any) => g.groupName).sort();

        const adGroupTreeNodes: TreeNode[] = groupsRaw.map((g: any) => ({
          id: g.id,
          name: g.groupName,
          type: 'group' as const,
          children: [],
          userData: { currentPage: 0, hasMore: true },
        }));
        this.dataSource.data = adGroupTreeNodes;

        this.loadAccessTreeData(false);

        adGroupTreeNodes.forEach((node) => {
          this.loadUsersForGroupNode(node, false);
        });

        if (adGroupTreeNodes.length && !this.selectedNode) {
          this.treeControl.expand(adGroupTreeNodes[0]);
          this.selectNode(adGroupTreeNodes[0]);
        }
      },
      error: (err) => console.error(err),
    });

    this.loadIdentityVaultTree(false);
  }

  toggleGroupNode(node: TreeNode): void {
    if (node.type === 'group' && this.treeControl.isExpanded(node)) {
      node.userData = node.userData || { currentPage: 0, hasMore: true };
      if (!node.children || node.children.length === 0) {
        this.loadUsersForGroupNode(node, false);
      }
    }
  }

  loadUsersForGroupNode(node: TreeNode, append: boolean = false): void {
    const pageToFetch = node.userData?.currentPage || 0;

    this.api
      .getusersbygroupname(node.name, pageToFetch, this.nestedUserPageSize)
      .subscribe({
        next: (res: any) => {
          const fetchedUsers =
            res.content || res.data || (Array.isArray(res) ? res : []);
          const currentTree: TreeNode[] = JSON.parse(
            JSON.stringify(this.dataSource.data),
          );
          const targetGroupNode = this.findNodeByName(currentTree, node.name);

          if (targetGroupNode) {
            const uniqueNames = new Set<string>();
            let existingChildren: TreeNode[] = [];

            if (append && targetGroupNode.children) {
              existingChildren = [...targetGroupNode.children];
              existingChildren.forEach((child) =>
                uniqueNames.add(child.name.toLowerCase()),
              );
            }

            const newUniqueChildren: TreeNode[] = [];

            fetchedUsers.forEach((user: any) => {
              const userName =
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                'Unknown User';
              const uniqueKey = userName.toLowerCase();

              if (!uniqueNames.has(uniqueKey)) {
                uniqueNames.add(uniqueKey);
                newUniqueChildren.push({
                  id: user.id,
                  name: userName,
                  type: 'user',
                  groupList: targetGroupNode.name,
                  userData: user,
                });
              }
            });

            if (append) {
              targetGroupNode.children = [
                ...existingChildren,
                ...newUniqueChildren,
              ];
            } else {
              targetGroupNode.children = newUniqueChildren;
            }

            targetGroupNode.userData.hasMore = res.last === false;
            this.dataSource.data = currentTree;
          }
        },
        error: (err) =>
          console.error('Error loading users by group name:', err),
      });
  }

  private findNodeByName(nodes: TreeNode[], name: string): TreeNode | null {
    for (const node of nodes) {
      if (node.name === name) return node;
      if (node.children) {
        const found = this.findNodeByName(node.children, name);
        if (found) return found;
      }
    }
    return null;
  }

  loadMoreNestedUsers(loadMoreNode: TreeNode, event?: Event): void {
    if (event) event.stopPropagation();
    const parentGroupNode = loadMoreNode.userData;
    if (parentGroupNode) {
      parentGroupNode.userData.currentPage++;
      this.loadUsersForGroupNode(parentGroupNode, true);
    }
  }

  handleMasterLeftLoadMore(): void {
    if (this.activeTabIndex === 0) {
      if (this.activeSelectedGroupNode) {
        this.activeSelectedGroupNode.userData.currentPage++;
        this.loadUsersForGroupNode(this.activeSelectedGroupNode, true);
      }
    } else if (this.activeTabIndex === 1) {
      this.leftPage++;
      this.loadIdentityVaultTree(true);
    }
  }

  get hasMoreGroupUsersData(): boolean {
    if (this.activeTabIndex === 0 && this.activeSelectedGroupNode) {
      return this.activeSelectedGroupNode.userData?.hasMore ?? false;
    }
    return false;
  }

  loadIdentityVaultTree(append: boolean = false): void {
    this.api
      .getlistofidentityvaults(this.leftPage, this.leftSize, '', '')
      .subscribe({
        next: (res: any) => {
          const identityList =
            res.content || res.data || (Array.isArray(res) ? res : []);

          this.hasMoreLeftData = identityList.length >= this.leftSize;

          if (append) {
            this.rawIdentitiesAccumulator = [
              ...this.rawIdentitiesAccumulator,
              ...identityList,
            ];
          } else {
            this.rawIdentitiesAccumulator = [...identityList];
          }

          const userMap = new Map<string, TreeNode>();

          this.rawIdentitiesAccumulator.forEach((user: any) => {
            const userName =
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              'Unknown User';
            const uniqueNameKey = userName.toLowerCase();

            if (!userMap.has(uniqueNameKey)) {
              userMap.set(uniqueNameKey, {
                id: user.id,
                name: userName,
                type: 'user',
                groupList: user.groupsList || '',
                userData: user,
              });
            }
          });

          this.usersDataSource.data = Array.from(userMap.values()).sort(
            (a, b) => a.name.localeCompare(b.name),
          );
        },
        error: (err) => {
          console.error(err);
          this.hasMoreLeftData = false;
        },
      });
  }

  loadAccessTreeData(append: boolean = false): void {
    const startIdx = this.accessPage * this.accessSize;
    const endIdx = startIdx + this.accessSize;
    const chunk = this.groupNames.slice(startIdx, endIdx);

    this.hasMoreAccessData = endIdx < this.groupNames.length;

    if (append) {
      this.rawAccessAccumulator = [...this.rawAccessAccumulator, ...chunk];
    } else {
      this.rawAccessAccumulator = chunk;
    }

    this.accessDataSource.data = this.rawAccessAccumulator.map((group) => ({
      name: group,
      type: 'directory' as const,
    }));
  }

  loadMoreAccess(): void {
    this.accessPage++;
    this.loadAccessTreeData(true);
  }

  loadFilesByGroup(groupName: string, userFilter: string = ''): void {
    const normalizedGroupName = groupName.trim();
    this.activeNormalizedGroupName = normalizedGroupName;

    const currentTargetCacheKey = `${normalizedGroupName}_page_${this.pageIndex}_user_${userFilter}`;

    if (this.globalFileCacheRegistry.has(currentTargetCacheKey)) {
      const cachedMetadata = this.globalFileCacheRegistry.get(
        currentTargetCacheKey,
      )!;
      this.totalElements = cachedMetadata.totalElements;
      this.totalPages = cachedMetadata.totalPages;
      this.renderTableData(groupName, cachedMetadata.rows);
      return;
    }

    this.isLoading = true;
    this.api
      .getallfilesbygroup(normalizedGroupName, this.pageIndex, this.pageSize)
      .subscribe({
        next: (res: any) => {
          let filesList =
            res.content || res.data || (Array.isArray(res) ? res : []);

          if (userFilter) {
            const filterLower = userFilter.toLowerCase().trim();
            filesList = filesList.filter((file: any) => {
              const fileUser = (file.username || '').toLowerCase().trim();
              if (!fileUser) return false;
              return (
                fileUser.includes(filterLower) || filterLower.includes(fileUser)
              );
            });
          }

          this.totalElements = userFilter
            ? filesList.length
            : (res.totalElements ?? filesList.length);
          this.totalPages = userFilter
            ? 1
            : (res.totalPages ?? Math.ceil(this.totalElements / this.pageSize));

          const mappedRows = this.mapFilePayloadToTableItems(
            filesList,
            groupName,
          );
          this.globalFileCacheRegistry.set(currentTargetCacheKey, {
            rows: mappedRows,
            totalElements: this.totalElements,
            totalPages: this.totalPages,
          });

          this.renderTableData(groupName, mappedRows);
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`❌ API Error for "${normalizedGroupName}":`, err);
          this.resetPaginationProperties();
          this.clearTableWithHeader(groupName);
          this.isLoading = false;
        },
      });
  }

  private mapFilePayloadToTableItems(
    filesList: any[],
    groupName: string,
  ): TableItem[] {
    return filesList.map((file: any) => ({
      id: file.id,
      name: file.itemName || '-',
      type: file.itemType?.toLowerCase() === 'folder' ? 'folder' : 'file',
      permissions: {
        F: file.fullControlOpenAccess || false,
        M: file.fullControlOpenAccess || false,
        R: file.readExecuteOpenAccess || file.openAccess || false,
        W: file.fullControlOpenAccess || false,
        X: file.readExecuteOpenAccess || false,
      },
      totalHitCount: file.folderFileHitCount || 0,
      size: file.folderFileSize || '-',
      classification: file.ruleCategory || '-',
      category: file.category || '-',
      directory: groupName,
      directoryname: file.itemName || '-',
    }));
  }

  private renderTableData(groupName: string, fileRows: TableItem[]): void {
    const parentRow: TableItem = {
      name: '',
      type: 'folder',
      permissions: { F: false, M: false, R: false, W: false, X: false },
      totalHitCount: 0,
      size: '',
      classification: null,
      category: null,
      directory: groupName,
      directoryname: groupName,
    };
    this.tableData = [parentRow, ...fileRows];
    this.generatePages();
  }

  invalidateCacheAndRefresh(): void {
    this.globalFileCacheRegistry.clear();
    this.activeFlightFetches.clear();
    this.refreshCurrentNodeFiles();
  }

  private resetPaginationProperties(): void {
    this.totalPages = 0;
    this.totalElements = 0;
    this.pages = [];
  }

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

  private refreshCurrentNodeFiles(): void {
    if (this.selectedNode) {
      let groupTargetName = '';
      let userTargetName = '';

      if (this.selectedNode.type === 'user') {
        const groupsArray = (this.selectedNode.groupList || '').split(',');
        groupTargetName = groupsArray[0].trim();
        userTargetName = this.selectedNode.name;
      } else if (
        ['group', 'directory', 'groupList'].includes(this.selectedNode.type)
      ) {
        groupTargetName = this.selectedNode.name;
      }

      if (groupTargetName) {
        this.loadFilesByGroup(groupTargetName, userTargetName);
      }
    }
  }

  goToPage = (p: number) => {
    if (p !== this.pageIndex + 1 && !this.isLoading) {
      this.pageIndex = p - 1;
      this.refreshCurrentNodeFiles();
    }
  };

  nextPage = () => {
    if (this.pageIndex < this.totalPages - 1 && !this.isLoading) {
      this.pageIndex++;
      this.refreshCurrentNodeFiles();
    }
  };

  prevPage = () => {
    if (this.pageIndex > 0 && !this.isLoading) {
      this.pageIndex--;
      this.refreshCurrentNodeFiles();
    }
  };

  firstPage = () => {
    if (this.pageIndex !== 0 && !this.isLoading) {
      this.pageIndex = 0;
      this.refreshCurrentNodeFiles();
    }
  };

  lastPage = () => {
    if (
      this.totalPages > 0 &&
      this.pageIndex !== this.totalPages - 1 &&
      !this.isLoading
    ) {
      this.pageIndex = this.totalPages - 1;
      this.refreshCurrentNodeFiles();
    }
  };

  clearTableWithHeader(groupName: string): void {
    this.tableData = [
      {
        name: '',
        type: 'folder',
        permissions: { F: false, M: false, R: false, W: false, X: false },
        totalHitCount: 0,
        size: '',
        classification: null,
        category: null,
        directory: groupName,
        directoryname: groupName,
      },
    ];
  }

  hasChild = (_: number, node: TreeNode) => node.type === 'group';

  selectNode(node: TreeNode) {
    if (node.type === 'loadMore') return;
    this.selectedNode = node;
    this.selectedNodeType = node.type;

    if (node.type === 'group') {
      this.activeSelectedGroupNode = node;
    }

    this.pageIndex = 0;
    this.resetPaginationProperties();

    let groupTargetName = '';
    let userTargetName = '';

    if (node.type === 'user') {
      const groupsArray = (node.groupList || '').split(',');
      groupTargetName = groupsArray[0].trim();
      userTargetName = node.name;
    } else if (['group', 'directory', 'groupList'].includes(node.type)) {
      groupTargetName = node.name;
    }

    if (groupTargetName) {
      this.loadFilesByGroup(groupTargetName, userTargetName);
    } else {
      this.clearTableWithHeader('No Group Assigned');
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.activeTabIndex = event.index;
    if (this.activeTabIndex === 0 && this.dataSource.data.length) {
      const first = this.dataSource.data[0];
      this.treeControl.expand(first);
      this.selectNode(first);
    } else if (this.activeTabIndex === 1 && this.usersDataSource.data.length) {
      this.selectNode(this.usersDataSource.data[0]);
    } else if (this.activeTabIndex === 2 && this.accessDataSource.data.length) {
      this.selectNode(this.accessDataSource.data[0]);
    }
  }

  isAllAccessTrue(access: any): boolean {
    return access ? Object.values(access).every((val) => val === true) : false;
  }

  onAddClick() {
    if (this.activeTabIndex === 0) this.openResourceEditDialog();
    else if (this.activeTabIndex === 1) this.openAddUserDialog();
    else if (this.activeTabIndex === 2) this.openAddAccessDialog();
  }

  // 🔥 UPDATED DELETE METHOD
  onDeleteClick(element: TableItem) {
    let groupId = '1';
    const groupNode = this.dataSource.data.find(
      (g) => g.name === element.directory,
    );

    if (groupNode?.id) {
      groupId = groupNode.id.toString();
    } else if (this.activeSelectedGroupNode?.name === element.directory) {
      groupId = this.activeSelectedGroupNode.id?.toString() || '1';
    }

    // Build the Payload precisely for deletion
    const payload = [
      {
        groupId: groupId,
        groupName: element.directory,
        folderId: element.id?.toString() || '',
        folderName: element.name,
        status: 'Delete', // Ensures deletion logic fires on backend
      },
    ];

    this.isLoading = true;

    this.api.addFolderToGroup(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showMessage('Access deleted successfully');
        this.invalidateCacheAndRefresh();
      },
      error: (err) => {
        console.error('❌ Delete failed', err);
        this.isLoading = false;
        this.showMessage('Failed to delete access');
      },
    });
  }

  // ✅ New Snack Bar Helper for Delete Action
  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  openCloudDialog(
    card: CardData,
    shared: SharedData[],
    externalFiles: ExternalFilesData[],
  ) {
    this.dialog.open(CloudresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: { ...card, shared, externalFiles },
    });
  }

  openAddUserDialog() {
    const activeGroup = this.activeSelectedGroupNode
      ? {
          id: this.activeSelectedGroupNode.id,
          name: this.activeSelectedGroupNode.name,
        }
      : null;

    const dialogRef = this.dialog.open(AdduserdpopupComponent, {
      width: '34.375rem',
      minWidth: '34.375rem',
      maxWidth: '100%',
      data: { group: activeGroup },
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) {
        this.invalidateCacheAndRefresh();
        if (this.activeSelectedGroupNode) {
          this.activeSelectedGroupNode.userData.currentPage = 0;
          this.loadUsersForGroupNode(this.activeSelectedGroupNode, false);
        }
      }
    });
  }

  openAddAccessDialog() {
    const activeGroup = this.activeSelectedGroupNode
      ? {
          id: this.activeSelectedGroupNode.id,
          name: this.activeSelectedGroupNode.name,
        }
      : null;

    const dialogRef = this.dialog.open(AddaccessdpopupComponent, {
      width: '46rem',
      minWidth: '46rem',
      maxWidth: '100%',
      data: { group: activeGroup },
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) this.invalidateCacheAndRefresh();
    });
  }

  openResourceEditDialog() {
    const dialogRef = this.dialog.open(ResourceeditdpopupComponent, {
      width: '58rem',
      minWidth: '58rem',
      maxWidth: '100%',
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) this.invalidateCacheAndRefresh();
    });
  }
}
