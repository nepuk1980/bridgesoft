import { Component, OnInit } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface RuleResponseInterface {
  id: number;
  ruleName: string;
  ruleDesc: string;
  active: boolean;
  ruleCategory: string;
  createDatetime: string | null;
  lastModifiedDatetime: string;
}

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [
    InnerheaderComponent,
    RouterModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule,
    NgFor,
    NgIf,
    HttpClientModule,
    MatSnackBarModule,
  ],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.css',
})
export class RulesComponent implements OnInit {
  isLoading = false;

  filters: { value: string; viewValue: string }[] = [];

  originalData: any[] = [];
  dataSource: any[] = [];

  searchText = '';
  selectedFilter = '';
  selectedSort: 'latest' | 'oldest' = 'latest';

  constructor(
    private api: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getRules();
  }

  // ✅ API CALL
  getRules() {
    this.isLoading = true;

    const sortParam = this.selectedSort === 'oldest' ? 'Asc' : 'Desc';

    this.api.getrules(sortParam, undefined).subscribe({
      next: (res) => {
        const content = res || [];

        const mappedData = content.map((item: RuleResponseInterface) => ({
          id: String(item.id),
          rule_name: item.ruleName || '',
          rule_category: item.ruleCategory || '',
          rule_desc: item.ruleDesc || '',
          active: item.active ?? false,
          requestedDate: item.lastModifiedDatetime || item.createDatetime || '',
        }));

        this.originalData = mappedData;
        this.dataSource = [...mappedData];

        // ✅ Dynamic Filters
        const uniqueCategories = [
          ...new Set(mappedData.map((item) => item.rule_category)),
        ];

        this.filters = uniqueCategories.map((cat) => ({
          value: cat,
          viewValue: cat,
        }));

        this.filterData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
      },
    });
  }

  // 🔍 Search
  applyFilter(value: string) {
    this.searchText = (value || '').toLowerCase();
    this.filterData();
  }

  // 🔄 Filter (sorting removed from here — handled by API)
  filterData() {
    let data = [...this.originalData];

    // ✅ Search
    if (this.searchText) {
      data = data.filter(
        (item) =>
          (item.rule_name || '').toLowerCase().includes(this.searchText) ||
          (item.rule_desc || '').toLowerCase().includes(this.searchText) ||
          (item.rule_category || '').toLowerCase().includes(this.searchText) ||
          (item.id || '').toLowerCase().includes(this.searchText),
      );
    }

    // ✅ Category Filter
    if (this.selectedFilter) {
      data = data.filter((item) => item.rule_category === this.selectedFilter);
    }

    this.dataSource = data;
  }

  // 🔁 Sort change → API call
  onSortChange(value: 'latest' | 'oldest') {
    this.selectedSort = value;
    this.getRules();
  }

  // 🔢 Count
  get filteredCount() {
    return this.dataSource.length;
  }

  get totalCount() {
    return this.originalData.length;
  }

  // 🔗 Slug helper
  createSlug(userName: string): string {
    return (userName || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  // ✅ TOGGLE UPDATE
  onToggleChange(item: any, status: boolean) {
    const previousStatus = item.active;

    item.active = status;
    item.loading = true;

    const payload = {
      ruleName: item.rule_name,
      ruleDesc: item.rule_desc,
      ruleCategory: item.rule_category,
      active: status,
    };

    this.api.updaterule(item.id, payload).subscribe({
      next: () => {
        item.loading = false;

        const message = status
          ? 'Rule activated successfully'
          : 'Rule deactivated successfully';

        this.showMessage(message);
      },
      error: (err) => {
        console.error(err);

        item.loading = false;
        item.active = previousStatus;

        this.showMessage('Failed to update rule');
      },
    });
  }

  // ✅ SNACKBAR
  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }
}
