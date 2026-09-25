// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
// import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
// import { MatIconModule } from '@angular/material/icon';
// import { NgClass, NgFor, NgIf } from '@angular/common';
// import { NestedTreeControl } from '@angular/cdk/tree';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { FormsModule } from '@angular/forms';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { provideNativeDateAdapter } from '@angular/material/core';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatTimepickerModule } from '@angular/material/timepicker';
// import { ApiService } from '../../services/api.service';
// import { Subject, forkJoin, Observable } from 'rxjs';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import {
//   debounceTime,
//   distinctUntilChanged,
//   switchMap,
//   map,
// } from 'rxjs/operators';
// import { MatSnackBar } from '@angular/material/snack-bar';

// interface TreeNode {
//   name: string;
//   type: 'department' | 'user' | 'directory';
//   children?: TreeNode[];
//   selected?: boolean;
// }

// @Component({
//   selector: 'app-alert-configuration',
//   standalone: true,
//   providers: [provideNativeDateAdapter()],
//   imports: [
//     InnerheaderComponent,
//     MatButtonModule,
//     MatSelectModule,
//     MatTabsModule,
//     MatTreeModule,
//     MatIconModule,
//     NgIf,
//     NgFor,
//     NgClass,
//     MatSlideToggleModule,
//     FormsModule,
//     MatCheckboxModule,
//     MatRadioModule,
//     MatFormFieldModule,
//     MatDatepickerModule,
//     MatTimepickerModule,
//     MatInputModule,
//     RouterLink,
//   ],
//   templateUrl: './alert-configuration.component.html',
//   styleUrl: './alert-configuration.component.css',
// })
// export class AlertConfigurationComponent implements OnInit {
//   /* ---------- FORM STATE VARIABLES ---------- */
//   alertSummary: string = '';
//   alertDescription: string = '';
//   dateFrom: Date | null = null;
//   dateTo: Date | null = null;
//   selectedTime: any = null;
//   recipientEmail: string = '';

//   /* ---------- ACTIVE STATES ---------- */
//   selectedIncludeNode: TreeNode | null = null;
//   selectedExcludeNode: TreeNode | null = null;

//   /* ---------- TREE CONTROLS ---------- */
//   includeTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
//   excludeTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
//   usersTreeControl = new NestedTreeControl<TreeNode>(() => []);
//   accessTreeControl = new NestedTreeControl<TreeNode>(() => []);

//   /* ---------- DATA SOURCES ---------- */
//   includeDataSource = new MatTreeNestedDataSource<TreeNode>();
//   excludeDataSource = new MatTreeNestedDataSource<TreeNode>();
//   includeUsersDataSource = new MatTreeNestedDataSource<TreeNode>();
//   excludeUsersDataSource = new MatTreeNestedDataSource<TreeNode>();
//   includeAccessDataSource = new MatTreeNestedDataSource<TreeNode>();
//   excludeAccessDataSource = new MatTreeNestedDataSource<TreeNode>();

//   /* ---------- FORM SELECTION CONTROLS ---------- */
//   groupNames: string[] = [];
//   itemType: 'File' | 'Folder' = 'File';
//   selecteAccessFolder: string = '';
//   selectedResources: string[] = [];

//   /* ---------- RESOURCES STATE ---------- */
//   itemName: string[] = [];
//   filteredItemNames: string[] = [];
//   page = 0;
//   size = 50;
//   totalElements = 0;
//   loadingResources = false;
//   searchText = '';
//   private searchSubject = new Subject<string>();

//   /* ---------- DIRECTORY VAULT (TREES) STATE ---------- */
//   treePage = 0;
//   treeSize = 50;
//   hasMoreTreeElements = true;
//   loadingTreeData = false;

//   includeSearchText: string = '';
//   excludeSearchText: string = '';

//   private allCompiledGroupData: any[] = [];

//   private filteredMasterIncludeGroups: TreeNode[] = [];
//   private filteredMasterIncludeUsers: TreeNode[] = [];
//   private filteredMasterIncludeAccess: TreeNode[] = [];
//   private filteredMasterExcludeGroups: TreeNode[] = [];
//   private filteredMasterExcludeUsers: TreeNode[] = [];
//   private filteredMasterExcludeAccess: TreeNode[] = [];

//   /* ---------- MISC OPTIONS CONTROLS ---------- */
//   isCheckedWebAlert = false;
//   isCheckedEmailAlert = false;
//   isCheckedAllTheTime = false;
//   selectedTimezone = 'GMT';

//   days = [
//     { label: 'S', value: 'sun' },
//     { label: 'M', value: 'mon' },
//     { label: 'T', value: 'tue' },
//     { label: 'W', value: 'wed' },
//     { label: 'T', value: 'thu' },
//     { label: 'F', value: 'fri' },
//     { label: 'S', value: 'sat' },
//   ];
//   selectedDays: string[] = [];

//   constructor(
//     private api: ApiService,
//     private cdr: ChangeDetectorRef,
//     private router: Router,
//     private http: HttpClient,
//     private snackBar: MatSnackBar,
//   ) {}

//   ngOnInit(): void {
//     this.fetchAllUsersByGroup();
//     this.getADGroup();
//     this.getResources();

//     this.searchSubject
//       .pipe(debounceTime(400), distinctUntilChanged())
//       .subscribe(() => {
//         this.resetAndFetchWithSearch();
//       });
//   }

//   getADGroup(): void {
//     this.api.getadgroups().subscribe({
//       next: (res) => {
//         this.groupNames = res.map((item: any) => item.groupName);
//       },
//       error: (err) => console.error('Failed fetching AD groups:', err),
//     });
//   }

//   fetchAllUsersByGroup(): void {
//     if (this.loadingTreeData) return;
//     this.loadingTreeData = true;

//     this.api
//       .getadgroups()
//       .pipe(
//         switchMap((groups: any[]) => {
//           if (!groups || !groups.length) {
//             this.hasMoreTreeElements = false;
//             return [[]];
//           }

//           const detailRequests: Observable<any>[] = groups.map((group: any) => {
//             const currentGroupName = group.groupName?.toLowerCase().trim();

//             return this.api
//               .getlistofidentityvaults(this.treePage, this.treeSize, '', '')
//               .pipe(
//                 map((res: any) => {
//                   const vaultUsers = res?.content || [];
//                   const totalVaultElements = res?.totalElements || 0;

//                   if (
//                     (this.treePage + 1) * this.treeSize >=
//                     totalVaultElements
//                   ) {
//                     this.hasMoreTreeElements = false;
//                   }

//                   const uniqueUserNames = [
//                     ...new Set(
//                       vaultUsers
//                         .filter((user: any) => {
//                           const deptStr = (user.department || '')
//                             .toLowerCase()
//                             .trim();
//                           const groupsStr = (user.groupsList || '')
//                             .toLowerCase()
//                             .trim();
//                           return (
//                             deptStr === currentGroupName ||
//                             groupsStr.includes(currentGroupName)
//                           );
//                         })
//                         .map((user: any) =>
//                           `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//                         )
//                         .filter((fullName: string) => fullName.length > 0),
//                     ),
//                   ];

//                   return {
//                     groupName: group.groupName,
//                     users: uniqueUserNames,
//                   };
//                 }),
//               );
//           });

//           return forkJoin(detailRequests);
//         }),
//       )
//       .subscribe({
//         next: (completeDataMap: any[]) => {
//           this.allCompiledGroupData = completeDataMap;
//           this.applyGroupFilter();
//         },
//         error: (err) => {
//           console.error('Error compiling lists:', err);
//           this.loadingTreeData = false;
//         },
//       });
//   }

//   onWhenSomeoneChange(selectedValue: string): void {
//     this.selecteAccessFolder = selectedValue;
//     // this.applyGroupFilter();
//   }

//   filterIncludeTree(): void {
//     const search = this.includeSearchText.toLowerCase().trim();

//     if (!search) {
//       this.includeDataSource.data = this.deepCloneTree(
//         this.filteredMasterIncludeGroups,
//       );
//     } else {
//       this.includeDataSource.data = this.performNestedTreeFilter(
//         this.filteredMasterIncludeGroups,
//         search,
//       );
//       this.expandAllTreeNodes(
//         this.includeDataSource.data,
//         this.includeTreeControl,
//       );
//     }

//     this.includeUsersDataSource.data = this.filteredMasterIncludeUsers.filter(
//       (node) => node.name.toLowerCase().includes(search),
//     );

//     this.includeAccessDataSource.data = this.filteredMasterIncludeAccess.filter(
//       (node) => node.name.toLowerCase().includes(search),
//     );

//     this.cdr.detectChanges();
//   }

//   filterExcludeTree(): void {
//     const search = this.excludeSearchText.toLowerCase().trim();

//     if (!search) {
//       this.excludeDataSource.data = this.deepCloneTree(
//         this.filteredMasterExcludeGroups,
//       );
//     } else {
//       this.excludeDataSource.data = this.performNestedTreeFilter(
//         this.filteredMasterExcludeGroups,
//         search,
//       );
//       this.expandAllTreeNodes(
//         this.excludeDataSource.data,
//         this.excludeTreeControl,
//       );
//     }

//     this.excludeUsersDataSource.data = this.filteredMasterExcludeUsers.filter(
//       (node) => node.name.toLowerCase().includes(search),
//     );

//     this.excludeAccessDataSource.data = this.filteredMasterExcludeAccess.filter(
//       (node) => node.name.toLowerCase().includes(search),
//     );

//     this.cdr.detectChanges();
//   }

//   private performNestedTreeFilter(
//     nodes: TreeNode[],
//     search: string,
//   ): TreeNode[] {
//     return nodes
//       .map((node) => ({
//         ...node,
//         children: node.children ? [...node.children] : undefined,
//       }))
//       .filter((node) => {
//         const nameMatches = node.name.toLowerCase().includes(search);

//         if (node.type === 'department' && nameMatches) {
//           return true;
//         }

//         if (node.children && node.children.length > 0) {
//           node.children = this.performNestedTreeFilter(node.children, search);
//           return node.children.length > 0;
//         }
//         return nameMatches;
//       });
//   }

//   private deepCloneTree(nodes: TreeNode[]): TreeNode[] {
//     return nodes.map((node) => ({
//       ...node,
//       children: node.children ? this.deepCloneTree(node.children) : undefined,
//     }));
//   }

//   private expandAllTreeNodes(
//     nodes: TreeNode[],
//     control: NestedTreeControl<TreeNode>,
//   ): void {
//     nodes.forEach((node) => {
//       control.expand(node);
//       if (node.children) {
//         this.expandAllTreeNodes(node.children, control);
//       }
//     });
//   }

//   private mergeOrAddGroupNode(targetTree: TreeNode[], newNode: TreeNode): void {
//     const existingGroup = targetTree.find((g) => g.name === newNode.name);
//     if (existingGroup) {
//       if (newNode.children) {
//         existingGroup.children = existingGroup.children || [];
//         newNode.children.forEach((newChild) => {
//           if (!existingGroup.children!.some((c) => c.name === newChild.name)) {
//             existingGroup.children!.push(newChild);
//           }
//         });
//       }
//     } else {
//       targetTree.push(newNode);
//     }
//   }

//   loadMoreTreeData(): void {
//     if (!this.hasMoreTreeElements || this.loadingTreeData) return;
//     this.treePage++;
//     this.fetchAllUsersByGroup();
//   }

//   /* ---------- CHECKBOX SELECTION CASCADE LOGIC ---------- */
//   toggleParentSelection(node: TreeNode, checked: boolean): void {
//     node.selected = checked;

//     // Recursively select/deselect all children
//     if (node.children) {
//       node.children.forEach((child) => {
//         this.toggleParentSelection(child, checked);
//       });
//     }

//     // Trigger change detection to update the UI
//     this.cdr.detectChanges();
//   }

//   checkParentSelectionRules(node: TreeNode, dataSourceData: TreeNode[]): void {
//     const parentNode = this.getParentNode(node, dataSourceData);
//     if (!parentNode || !parentNode.children) return;

//     parentNode.selected = parentNode.children.every((child) => child.selected);
//     this.cdr.detectChanges();

//     this.checkParentSelectionRules(parentNode, dataSourceData);
//   }

//   getParentNode(targetNode: TreeNode, nodes: TreeNode[]): TreeNode | null {
//     for (const node of nodes) {
//       if (
//         node.children &&
//         node.children.some((child) => child === targetNode)
//       ) {
//         return node;
//       } else if (node.children) {
//         const parent = this.getParentNode(targetNode, node.children);
//         if (parent) return parent;
//       }
//     }
//     return null;
//   }

//   descendantsPartiallySelected(node: TreeNode): boolean {
//     if (!node.children || !node.children.length) return false;
//     const allChecked = node.children.every((child) => child.selected);
//     const someChecked = node.children.some(
//       (child) => child.selected || this.descendantsPartiallySelected(child),
//     );
//     return someChecked && !allChecked;
//   }

//   /* ---------- LOGICAL EXTRACTOR FOR DATA SUBMISSION ---------- */
//   private getSelectedNodes(nodes: TreeNode[]): any[] {
//     let selected: any[] = [];
//     nodes.forEach((node) => {
//       if (node.selected) {
//         selected.push({ name: node.name, type: node.type });
//       }
//       if (node.children && node.children.length > 0) {
//         selected = [...selected, ...this.getSelectedNodes(node.children)];
//       }
//     });
//     return selected;
//   }

//   /* ---------- SAVE ACTION METRIC LOGGING ---------- */
//   applyGroupFilter(): void {
//     const currentGroupsInclude: TreeNode[] = [];
//     const currentGroupsExclude: TreeNode[] = [];
//     const currentUsersInclude: TreeNode[] = [];
//     const currentUsersExclude: TreeNode[] = [];
//     const currentAccessInclude: TreeNode[] = [];
//     const currentAccessExclude: TreeNode[] = [];

//     // Always process full compiled data
//     this.allCompiledGroupData.forEach((item) => {
//       const createGroupNode = (): TreeNode => ({
//         name: item.groupName,
//         type: 'department',
//         selected: false,
//         children: item.users.map((userName: string) => ({
//           name: userName,
//           type: 'user',
//           selected: false,
//         })),
//       });

//       this.mergeOrAddGroupNode(currentGroupsInclude, createGroupNode());
//       this.mergeOrAddGroupNode(currentGroupsExclude, createGroupNode());

//       item.users.forEach((userName: string) => {
//         if (!currentUsersInclude.some((u) => u.name === userName)) {
//           currentUsersInclude.push({
//             name: userName,
//             type: 'user',
//             selected: false,
//           });
//         }
//         if (!currentUsersExclude.some((u) => u.name === userName)) {
//           currentUsersExclude.push({
//             name: userName,
//             type: 'user',
//             selected: false,
//           });
//         }
//       });

//       if (!currentAccessInclude.some((a) => a.name === item.groupName)) {
//         currentAccessInclude.push({
//           name: item.groupName,
//           type: 'directory',
//           selected: false,
//         });
//       }
//       if (!currentAccessExclude.some((a) => a.name === item.groupName)) {
//         currentAccessExclude.push({
//           name: item.groupName,
//           type: 'directory',
//           selected: false,
//         });
//       }
//     });

//     this.filteredMasterIncludeGroups = currentGroupsInclude;
//     this.filteredMasterIncludeUsers = currentUsersInclude;
//     this.filteredMasterIncludeAccess = currentAccessInclude;

//     this.filteredMasterExcludeGroups = currentGroupsExclude;
//     this.filteredMasterExcludeUsers = currentUsersExclude;
//     this.filteredMasterExcludeAccess = currentAccessExclude;

//     this.filterIncludeTree();
//     this.filterExcludeTree();

//     this.loadingTreeData = false;
//     this.cdr.detectChanges();
//   }

//   /* ---------- SAVE ACTION METRIC LOGGING ---------- */
//   saveAlert(): void {
//     // Helper to extract specific types from a flat array or tree
//     const getSelectedByType = (
//       data: TreeNode[],
//       type: 'department' | 'user' | 'directory',
//     ): string => {
//       const names: string[] = [];
//       const traverse = (nodes: TreeNode[]) => {
//         nodes.forEach((node) => {
//           if (node.selected && node.type === type) {
//             names.push(node.name);
//           }
//           if (node.children) traverse(node.children);
//         });
//       };
//       traverse(data);
//       return [...new Set(names)].join(',');
//     };

//     const payload = {
//       alertName: this.alertSummary,
//       alertDesc: this.alertDescription,
//       whenSomeone: this.selecteAccessFolder,
//       alertAction: this.itemType,
//       alertResources: this.selectedResources.join(','),

//       // Include Fields
//       includeGroups: getSelectedByType(
//         this.includeDataSource.data,
//         'department',
//       ),
//       includeUsers: getSelectedByType(this.includeDataSource.data, 'user'),
//       includeResources: this.selectedResources.join(','),

//       // Exclude Fields
//       excludeGroups: getSelectedByType(
//         this.excludeDataSource.data,
//         'department',
//       ),
//       excludeUsers: getSelectedByType(this.excludeDataSource.data, 'user'),
//       excludeResources: this.selectedResources.join(','),

//       // ... (rest of your date/time fields)
//       allTheTime: this.isCheckedAllTheTime,
//       fromDate: this.dateFrom ? this.dateFrom.toISOString() : '',
//       toDate: this.dateTo ? this.dateTo.toISOString() : '',
//       days: this.selectedDays
//         .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
//         .join(','),
//       timeZone: this.selectedTimezone,
//       alertTime: this.selectedTime
//         ? new Date(this.selectedTime).toISOString()
//         : '',
//       alertMode: this.isCheckedWebAlert ? 'Web Alert' : 'Email Alert',
//       alertEmail: this.isCheckedEmailAlert ? this.recipientEmail : '',
//     };

//     this.api.saveAlertDetails(payload).subscribe({
//       next: (response: string) => {
//         // 'response' will now be the string "Alert Saved Successfully"
//         this.showMessage(response);
//         setTimeout(() => {
//           this.router.navigate(['/review-access']);
//         }, 1000);
//       },
//       error: (err) => {
//         // If the status is 200 but it still fails, it's a parsing issue.
//         // If it's a real network error, this block will catch it.
//         if (err.status === 200) {
//           this.showMessage('Alert saved successfully!');
//           this.router.navigate(['/review-access']);
//         } else {
//           console.error('Error saving alert:', err);
//           this.showMessage('Failed to save alert.');
//         }
//       },
//     });
//   }
//   // Helper used by saveAlert to extract names
//   private getSelectedTreeNames(nodes: TreeNode[]): string {
//     let names: string[] = [];
//     const traverse = (nodeList: TreeNode[]) => {
//       nodeList.forEach((node) => {
//         if (node.selected) names.push(node.name);
//         if (node.children) traverse(node.children);
//       });
//     };
//     traverse(nodes);
//     return [...new Set(names)].join(',');
//   }

//   /* ---------- RESOURCES ---------- */
//   getResources(): void {
//     if (this.loadingResources) return;
//     this.loadingResources = true;

//     this.api
//       .getAllFilesAndFoldersDetails(
//         this.searchText,
//         '',
//         '',
//         this.page,
//         this.size,
//       )
//       .subscribe({
//         next: (res) => {
//           const content = res?.content || [];
//           this.totalElements = res?.totalElements || 0;

//           const newItems = content
//             .filter(
//               (item: any) => item.itemType === this.itemType && item.itemName,
//             )
//             .map((item: any) => item.itemName);

//           if (this.page === 0) {
//             this.itemName = [...new Set(newItems)];
//           } else {
//             this.itemName = [...new Set([...this.itemName, ...newItems])];
//           }

//           this.filteredItemNames = [...this.itemName];
//           this.loadingResources = false;
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('Failed fetching data stream resources:', err);
//           this.loadingResources = false;
//         },
//       });
//   }

//   filterResources(): void {
//     this.searchSubject.next(this.searchText);
//   }

//   resetAndFetchWithSearch(): void {
//     this.page = 0;
//     this.itemName = [];
//     this.filteredItemNames = [];
//     this.getResources();
//   }

//   onItemTypeChange(type: 'File' | 'Folder'): void {
//     if (this.itemType === type) return;
//     this.itemType = type;
//     this.searchText = '';
//     this.selectedResources = [];
//     this.resetAndFetchWithSearch();
//   }

//   hasChild = (_: number, node: TreeNode) => node.type === 'department';

//   selectNode(node: TreeNode, side: 'include' | 'exclude') {
//     if (side === 'include') this.selectedIncludeNode = node;
//     if (side === 'exclude') this.selectedExcludeNode = node;
//   }

//   onTabChange(event: MatTabChangeEvent) {}

//   toggleDay(day: string) {
//     const index = this.selectedDays.indexOf(day);
//     if (index > -1) {
//       this.selectedDays.splice(index, 1);
//     } else {
//       this.selectedDays.push(day);
//     }
//   }
//   showMessage(message: string) {
//     this.snackBar.open(message, '', {
//       duration: 1000,
//       horizontalPosition: 'center',
//       verticalPosition: 'bottom',
//       panelClass: ['success-snackbar'],
//     });
//   }
// }
