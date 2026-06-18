import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
  groupName?: string;
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
    MatSnackBarModule,
  ],
  templateUrl: './administrative-control.component.html',
  styleUrl: './administrative-control.component.css',
})
export class AdministrativeControlComponent implements OnInit {
  @ViewChild('leftSearchInput') leftSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('rightSearchInput')
  rightSearchInput!: ElementRef<HTMLInputElement>;

  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'directory',
    'filesystempermissions',
    'totalhitcount',
    'size',
    'classification',
    'category',
    'action',
  ];

  tableData: any[] = [];
  isLoading = false;

  /** TREE CONTROLS */
  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  usersTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  usersDataSource = new MatTreeNestedDataSource<TreeNode>();

  accessTreeControl = new NestedTreeControl<TreeNode>(() => []);
  accessDataSource = new MatTreeNestedDataSource<TreeNode>();

  groupNames: string[] = [];

  // --- AD Group Pagination State ---
  groupPage = 0;
  groupSize = 10;
  groupNameFilter = '';
  hasMoreGroupsData = true;
  rawGroupsAccumulator: any[] = [];

  // --- Other Pagination State ---
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
    { rows: any[]; totalElements: number; totalPages: number }
  >();
  private rawTableDataMaster: any[] = [];
  private currentDirectoryLabel = '';
  searchQuery = '';
  leftSearchQuery = '';

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
    this.loadGroupsData(false);
    this.loadIdentityVaultTree(false);
  }

  loadGroupsData(append: boolean = false): void {
    this.api
      .getadgroups(this.groupNameFilter, this.groupPage, this.groupSize)
      .subscribe({
        next: (res: any) => {
          const groupsRaw = Array.isArray(res)
            ? res
            : res.content || res.data || [];

          this.hasMoreGroupsData = groupsRaw.length >= this.groupSize;

          if (append) {
            this.rawGroupsAccumulator = [
              ...this.rawGroupsAccumulator,
              ...groupsRaw,
            ];
          } else {
            this.rawGroupsAccumulator = [...groupsRaw];
          }

          this.groupNames = this.rawGroupsAccumulator
            .map((g: any) => g.groupName)
            .sort();

          const adGroupTreeNodes: TreeNode[] = this.rawGroupsAccumulator.map(
            (g: any) => ({
              id: g.id,
              name: g.groupName,
              type: 'group' as const,
              children: [],
              userData: { currentPage: 0, hasMore: true },
            }),
          );

          this.dataSource.data = adGroupTreeNodes;
          this.loadAccessTreeData(false);

          adGroupTreeNodes.forEach((node) => {
            this.loadUsersForGroupNode(node, false);
          });

          if (adGroupTreeNodes.length && !this.selectedNode && !append) {
            this.treeControl.expand(adGroupTreeNodes[0]);
            this.selectNode(adGroupTreeNodes[0]);
          }
        },
        error: (err) => {
          console.error('Error loading AD groups:', err);
          this.hasMoreGroupsData = false;
        },
      });
  }

  loadMoreGroups(): void {
    if (this.hasMoreGroupsData) {
      this.groupPage++;
      this.loadGroupsData(true);
    }
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
            let existingChildren: TreeNode[] = [];

            if (append && targetGroupNode.children) {
              existingChildren = [...targetGroupNode.children];
            }

            const newChildren: TreeNode[] = fetchedUsers.map((user: any) => {
              const userName =
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                'Unknown User';

              return {
                id: user.id,
                name: userName,
                type: 'user' as const,
                groupList: targetGroupNode.name,
                groupName: user.groupName || targetGroupNode.name,
                userData: user,
              };
            });

            if (append) {
              targetGroupNode.children = [...existingChildren, ...newChildren];
            } else {
              targetGroupNode.children = newChildren;
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
    this.loadMoreGroups();
    this.leftPage++;
    this.loadIdentityVaultTree(true);
  }

  get hasMoreGroupUsersData(): boolean {
    if (this.activeTabIndex === 0 && this.activeSelectedGroupNode) {
      return this.activeSelectedGroupNode.userData?.hasMore ?? false;
    }
    return false;
  }

  loadIdentityVaultTree(append: boolean = false): void {
    this.api
      .getlistofidentityvaults(
        this.leftPage,
        this.leftSize,
        this.leftSearchQuery,
        '',
      )
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

          const allUsers: TreeNode[] = this.rawIdentitiesAccumulator.map(
            (user: any) => {
              const userName =
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                'Unknown User';

              return {
                id: user.id,
                name: userName,
                type: 'user' as const,
                groupList: user.groupsList || '',
                groupName: user.groupName || user.groupsList || '',
                userData: user,
              };
            },
          );

          this.usersDataSource.data = allUsers.sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        },
        error: (err) => {
          console.error(err);
          this.hasMoreLeftData = false;
        },
      });
  }

  loadAccessTreeData(append: boolean = false): void {
    let sourceList = this.groupNames;
    if (this.leftSearchQuery) {
      sourceList = this.groupNames.filter((name) =>
        name.toLowerCase().includes(this.leftSearchQuery.toLowerCase()),
      );
    }

    const startIdx = this.accessPage * this.accessSize;
    const endIdx = startIdx + this.accessSize;
    const chunk = sourceList.slice(startIdx, endIdx);

    this.hasMoreAccessData = endIdx < sourceList.length;

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

  onLeftSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.leftSearchQuery = query;

    if (this.activeTabIndex === 0) {
      this.groupNameFilter = query;
      this.groupPage = 0;
      this.loadGroupsData(false);
    } else if (this.activeTabIndex === 1) {
      this.leftPage = 0;
      this.loadIdentityVaultTree(false);
    } else if (this.activeTabIndex === 2) {
      this.accessPage = 0;
      this.loadAccessTreeData(false);
    }
  }

  loadRightSideTableData(node: TreeNode): void {
    if (!node) return;

    const normalizedTargetName = node.name.trim();
    const cacheKey = `${node.type}_${normalizedTargetName}_page_${this.pageIndex}`;

    if (this.globalFileCacheRegistry.has(cacheKey)) {
      const cachedMetadata = this.globalFileCacheRegistry.get(cacheKey)!;
      this.totalElements = cachedMetadata.totalElements;
      this.totalPages = cachedMetadata.totalPages;
      this.renderTableData(normalizedTargetName, cachedMetadata.rows);
      return;
    }

    this.isLoading = true;

    const endpointObservable$ = (
      this.activeTabIndex === 2
        ? this.api.getusersbygroupname(
            normalizedTargetName,
            this.pageIndex,
            this.pageSize,
          )
        : node.type === 'user'
          ? this.api.getuserfoldersorfiles(
              normalizedTargetName,
              // 'Christopher Williams',
              this.pageIndex,
              this.pageSize,
            )
          : this.api.getgroupfoldersorfiles(
              normalizedTargetName,
              this.pageIndex,
              this.pageSize,
            )
    ) as any;

    endpointObservable$.subscribe({
      next: (res: any) => {
        const payloadContent = res?.content || [];

        this.totalElements = res?.totalElements ?? payloadContent.length;
        this.totalPages =
          res?.totalPages ?? Math.ceil(this.totalElements / this.pageSize);

        const mappedRows = this.mapPayloadToTableItems(
          payloadContent,
          normalizedTargetName,
        );

        this.globalFileCacheRegistry.set(cacheKey, {
          rows: mappedRows,
          totalElements: this.totalElements,
          totalPages: this.totalPages,
        });

        this.renderTableData(normalizedTargetName, mappedRows);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(
          `❌ API Error for type "${node.type}" label "${normalizedTargetName}":`,
          err,
        );
        this.clearTableWithHeader(normalizedTargetName);
        this.isLoading = false;
      },
    });
  }

  private parsePermissions(permissionsStr: string) {
    const cleanStr = (permissionsStr || '').toLowerCase().trim();
    const tokens = cleanStr.split(',').map((t) => t.trim());

    const hasFull = tokens.some((t) => t.includes('full control') || t === 'f');
    const hasModify = tokens.some((t) => t.includes('modify') || t === 'm');
    const hasRead = tokens.some((t) => t.includes('read') || t === 'r');
    const hasWrite = tokens.some((t) => t.includes('write') || t === 'w');
    const hasExecute = tokens.some((t) => t.includes('execute') || t === 'x');

    return {
      F: hasFull,
      M: hasModify,
      R: hasRead,
      W: hasWrite,
      X: hasExecute,
    };
  }

  private mapPayloadToTableItems(content: any[], label: string): any[] {
    if (this.activeTabIndex === 2) {
      return content.map((item: any) => ({
        id: item.id,
        firstName: item.firstName || '-',
        lastName: item.lastName || '-',
        email: item.email || '-',
        manager: item.manager || '-',
        assignedRoleSummary: item.assignedRoleSummary || '-',
        lastModifiedDatetime: item.lastModifiedDatetime || '-',
        riskScore:
          item.riskScore !== null && item.riskScore !== undefined
            ? item.riskScore
            : '-',
      }));
    }

    return content.map((item: any) => {
      return {
        id: item.id,
        name: item.folderName || '-',
        type: 'folder',
        permissions: this.parsePermissions(item.fileSystemPermissions),
        totalHitCount: item.totalHitCount || 0,
        size: item.folderFileSize || '-',
        classification: item.classification || '-',
        category: item.classification || '-',
        directory: label,
        directoryname: item.folderName || '-',
      };
    });
  }

  private renderTableData(directoryLabel: string, fileRows: any[]): void {
    this.currentDirectoryLabel = directoryLabel;
    this.rawTableDataMaster = fileRows || [];
    this.applyClientSideFilter();
  }

  onRightSideSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value;
    this.applyClientSideFilter();
  }

  private applyClientSideFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!this.rawTableDataMaster || this.rawTableDataMaster.length === 0) {
      this.tableData = [];
      this.generatePages();
      return;
    }

    if (!query) {
      if (this.activeTabIndex === 2) {
        this.tableData = [...this.rawTableDataMaster];
      } else {
        const parentRow = this.createParentRow(this.currentDirectoryLabel);
        this.tableData = [parentRow, ...this.rawTableDataMaster];
      }
      this.generatePages();
      return;
    }

    let filtered = [];
    if (this.activeTabIndex === 2) {
      // Access view identity filters (matches against First Name, Last Name, and email values)
      filtered = this.rawTableDataMaster.filter(
        (item) =>
          (item.firstName || '').toLowerCase().includes(query) ||
          (item.lastName || '').toLowerCase().includes(query) ||
          (item.email || '').toLowerCase().includes(query),
      );
      this.tableData = filtered;
    } else {
      // Groups (0) and Users (1) view files/folders filter routines
      filtered = this.rawTableDataMaster.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(query) ||
          (item.size || '').toLowerCase().includes(query) ||
          (item.classification || '').toLowerCase().includes(query) ||
          (item.category || '').toLowerCase().includes(query),
      );

      if (filtered.length === 0) {
        this.tableData = [];
      } else {
        const parentRow = this.createParentRow(this.currentDirectoryLabel);
        this.tableData = [parentRow, ...filtered];
      }
    }
    this.generatePages();
  }

  private createParentRow(directoryLabel: string): TableItem {
    return {
      name: '',
      type: 'folder',
      permissions: { F: false, M: false, R: false, W: false, X: false },
      totalHitCount: 0,
      size: '',
      classification: null,
      category: null,
      directory: directoryLabel,
      directoryname: directoryLabel,
    };
  }

  private clearSearchInputFields(): void {
    this.searchQuery = '';
    if (this.rightSearchInput) {
      this.rightSearchInput.nativeElement.value = '';
    }
  }

  private clearLeftSearchInputField(): void {
    this.leftSearchQuery = '';
    this.groupNameFilter = '';
    if (this.leftSearchInput) {
      this.leftSearchInput.nativeElement.value = '';
    }
  }

  invalidateCacheAndRefresh(): void {
    this.globalFileCacheRegistry.clear();
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
      this.loadRightSideTableData(this.selectedNode);
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
    this.tableData = [];
    this.rawTableDataMaster = [];
    this.resetPaginationProperties();
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
    this.clearSearchInputFields();

    if (this.activeTabIndex === 2) {
      this.displayedColumns = [
        'firstName',
        'lastName',
        'email',
        'manager',
        'assignedRoleSummary',
        'lastModifiedDatetime',
        'riskScore',
      ];
    } else {
      this.displayedColumns = [
        'directory',
        'filesystempermissions',
        'totalhitcount',
        'size',
        'classification',
        'category',
        'action',
      ];
    }

    this.loadRightSideTableData(node);
  }

  onTabChange(event: MatTabChangeEvent) {
    this.activeTabIndex = event.index;
    this.clearSearchInputFields();
    this.clearLeftSearchInputField();

    if (this.activeTabIndex === 0) {
      this.loadGroupsData(false);
    } else if (this.activeTabIndex === 1) {
      this.loadIdentityVaultTree(false);
    } else if (this.activeTabIndex === 2) {
      this.loadAccessTreeData(false);
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

  onDeleteClick(element: any) {
    this.isLoading = true;

    // 1. Contextually extract Group vs User information based on active tab
    let groupId: number | null = null;
    let groupName: string | null = null;
    let userId: number | null = null;
    let userName: string | null = null;

    if (this.activeTabIndex === 0) {
      // Groups Tab Context
      const targetGroup = this.activeSelectedGroupNode || this.selectedNode;
      if (targetGroup) {
        groupId = targetGroup.id ? Number(targetGroup.id) : null;
        groupName = targetGroup.name || null;
      }
    } else if (this.activeTabIndex === 1) {
      // Users Tab Context
      if (this.selectedNode && this.selectedNode.type === 'user') {
        userId = this.selectedNode.id ? Number(this.selectedNode.id) : null;
        userName = this.selectedNode.name || null;
      }
    }

    // 2. Map boolean permissions flags back into a clean comma-separated string
    const permissionsArray: string[] = [];
    if (element.permissions?.F) permissionsArray.push('Full Control');
    if (element.permissions?.M) permissionsArray.push('Modify');
    if (element.permissions?.R) permissionsArray.push('Read');
    if (element.permissions?.W) permissionsArray.push('Write');
    if (element.permissions?.X) permissionsArray.push('Execute');
    const mappedPermissions = permissionsArray.join(', ') || 'Read';

    // 3. Assemble the exact payload array tracking documentation specifications
    const payload = [
      {
        id: element.id ? Number(element.id) : null,
        groupId: groupId,
        groupName: groupName,
        folderId: element.id ? Number(element.id) : null,
        folderName: element.name || '',
        userId: userId,
        userName: userName,
        fileSystemPermissions: mappedPermissions,
        totalHitCount: element.totalHitCount
          ? Number(element.totalHitCount)
          : 0,
        folderFileSize: element.size || '-',
        classification: element.classification || '-',
        accessAction: 'Delete', // Hardcoded value
        status: 'New', // Hardcoded value
      },
    ];

    // 4. Fire the PUT request stream
    this.api.updatefolderorfiletothegrouporuser(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showMessage('Access deleted successfully');
        this.invalidateCacheAndRefresh();
      },
      error: (err: any) => {
        console.error('❌ Delete access failed:', err);
        this.isLoading = false;
        this.showMessage('Failed to delete access');
      },
    });
  }

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

  openAddUserDialog(inlineGroupNode?: TreeNode) {
    let targetGroup: TreeNode | null = null;

    // 🌟 FIX: Determine context based on the active tab layout
    if (this.activeTabIndex === 2) {
      // Access Tab: Always use the currently selected tree row directory node
      targetGroup = this.selectedNode;
    } else {
      // Groups/Users Tab: Use inline action item, active group layout, or row fallback
      targetGroup =
        inlineGroupNode || this.activeSelectedGroupNode || this.selectedNode;
    }

    const activeGroup = targetGroup
      ? {
          id: targetGroup.id ? Number(targetGroup.id) : null,
          name: targetGroup.name,
        }
      : null;

    console.log(
      'Selected Group Name Context:',
      activeGroup ? activeGroup.name : 'None',
    );

    const dialogRef = this.dialog.open(AdduserdpopupComponent, {
      width: '34.375rem',
      minWidth: '34.375rem',
      maxWidth: '100%',
      data: { group: activeGroup },
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) {
        this.invalidateCacheAndRefresh();
        if (targetGroup && targetGroup.userData) {
          targetGroup.userData.currentPage = 0;
          this.loadUsersForGroupNode(targetGroup, false);
        }
      }
    });
  }
  openAddAccessDialog(inlineGroupNode?: TreeNode) {
    const targetGroup = inlineGroupNode || this.activeSelectedGroupNode;

    const activeGroup = targetGroup
      ? {
          id: targetGroup.id,
          name: targetGroup.name,
        }
      : null;

    // Checks if the active clicked or selected tree node is a user, passing details contextually
    const activeUser =
      this.selectedNode?.type === 'user'
        ? {
            id: this.selectedNode.id,
            name: this.selectedNode.name,
          }
        : null;

    console.log('activeGroup', activeGroup);
    const dialogRef = this.dialog.open(AddaccessdpopupComponent, {
      width: '60rem',
      minWidth: '60rem',
      maxWidth: '100%',
      data: {
        group: activeGroup,
        user: activeUser,
      },
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) {
        this.invalidateCacheAndRefresh();
        if (targetGroup) {
          targetGroup.userData.currentPage = 0;
          this.loadUsersForGroupNode(targetGroup, false);
        }
      }
    });
  }

  openResourceEditDialog(element?: any) {
    let groupId: number | null = null;
    let groupName: string | null = null;
    let userId: number | null = null;
    let userName: string | null = null;
    let userGroupName: string | null = null;

    if (this.activeTabIndex === 0) {
      const targetGroup = this.activeSelectedGroupNode || this.selectedNode;
      if (targetGroup) {
        groupId = targetGroup.id ? Number(targetGroup.id) : null;
        groupName = targetGroup.name || null;
      }
    } else if (this.activeTabIndex === 1) {
      if (this.selectedNode && this.selectedNode.type === 'user') {
        userId = this.selectedNode.id ? Number(this.selectedNode.id) : null;
        userName = this.selectedNode.name || null;

        // 🌟 FIX: Added deep fallbacks checking fields on the node and embedded raw response payload
        userGroupName =
          this.selectedNode.groupName ||
          this.selectedNode.groupList ||
          this.selectedNode.userData?.groupName ||
          this.selectedNode.userData?.groupsList ||
          null;
      }
    }

    const dialogRef = this.dialog.open(ResourceeditdpopupComponent, {
      width: '58rem',
      minWidth: '58rem',
      maxWidth: '100%',
      data: {
        element: element || null,
        context: { groupId, groupName, userId, userName, userGroupName },
      },
    });

    dialogRef.afterClosed().subscribe((didUpdate) => {
      if (didUpdate) {
        this.invalidateCacheAndRefresh();
      }
    });
  }
}
