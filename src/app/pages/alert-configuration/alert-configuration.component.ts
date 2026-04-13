import { Component } from '@angular/core';
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

interface Resource {
  name: string;
  type?: 'file' | 'folder';
}

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
export class AlertConfigurationComponent {
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

  constructor() {
    /* FILTER GROUPS */

    const includeGroups = GROUP_TREE.filter((g) => g.filter === 'Include');
    const excludeGroups = GROUP_TREE.filter((g) => g.filter === 'Exclude');

    /* GROUP TREES */

    this.includeDataSource.data = includeGroups;
    this.excludeDataSource.data = excludeGroups;

    /* USERS */

    const includeUsers = includeGroups.flatMap((g) => g.children ?? []);
    const excludeUsers = excludeGroups.flatMap((g) => g.children ?? []);

    this.includeUsersDataSource.data = includeUsers;
    this.excludeUsersDataSource.data = excludeUsers;

    /* ACCESS */

    const includeAccess = includeGroups.map((g) => ({
      name: g.name,
      type: 'directory' as const,
    }));

    const excludeAccess = excludeGroups.map((g) => ({
      name: g.name,
      type: 'directory' as const,
    }));

    this.includeAccessDataSource.data = includeAccess;
    this.excludeAccessDataSource.data = excludeAccess;

    /* INITIAL EXPANSION */

    if (includeGroups.length) {
      this.includeTreeControl.expand(includeGroups[0]);
      this.selectedIncludeNode = includeGroups[0];
    }

    if (excludeGroups.length) {
      this.excludeTreeControl.expand(excludeGroups[0]);
      this.selectedExcludeNode = excludeGroups[0];
    }
  }

  /* ---------- TREE HELPER ---------- */

  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  /* ---------- NODE SELECTION ---------- */

  selectNode(node: TreeNode, side: 'include' | 'exclude') {
    if (side === 'include') {
      this.selectedIncludeNode = node;
    }

    if (side === 'exclude') {
      this.selectedExcludeNode = node;
    }
  }

  /* ---------- TAB CHANGE ---------- */

  onTabChange(event: MatTabChangeEvent) {
    console.log('Tab changed', event.index);
  }

  isCheckedWebAlert = false;
  isCheckedEmailAlert = false;
  isCheckedAllTheTime = false;
  searchText = '';

  resources: Resource[] = [
    { name: 'Finance', type: 'folder' },
    { name: 'Enrolment Terms.xlsx', type: 'file' },
    { name: 'Travel Terms.xlsx', type: 'file' },
    { name: 'Vendor Onboarding Terms.xlsx', type: 'file' },
  ];

  filteredResources = [...this.resources];

  selectedResources: Resource[] = [];

  filterResources() {
    const value = this.searchText.toLowerCase();

    this.filteredResources = this.resources.filter((r) =>
      r.name.toLowerCase().includes(value),
    );
  }

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

  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);

    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
  }
  selectedTimezone = 'GMT';
}
