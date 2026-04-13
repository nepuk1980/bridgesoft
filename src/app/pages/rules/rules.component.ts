import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

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
  ],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.css',
})
export class RulesComponent {
  // ✅ FULL JSON DATA
  originalData = [
    {
      id: '1',
      rule_name: 'Preview: US',
      rule_category: 'PII',
      rule_desc:
        'Predefined (Preview) (Policy Pack) This policy detects U.S. personally identifiable information (PII) such as social security numbers, diver’s license numbers, passport numbers and other sensitive date',
      active: false,
      requestedDate: '2026-02-28',
    },
    {
      id: '2',
      rule_name: 'Preview: BR',
      rule_category: 'LGPD',
      rule_desc:
        'Predefined 1 [Preview] [Policy Pack] Brazilian General Data Protection Axt & GPD - Lar Geral de Dedução de Deduio is a data protection law which requires compliance in regarda to processing of personal data. This policy detects Brazilian Fill such as passport numbers, drivers bilenos biumons, election f12 numbers, personal phone numbers, etc.',
      active: false,
      requestedDate: '2026-02-01',
    },
    {
      id: '3',
      rule_name: 'Preview: Sensitive Forms',
      rule_category: 'HIPAA',
      rule_desc:
        'Predefined 1 [Preview] [Policy Pack] Brazilian General Data Protection Axt & GPD - Lar Geral de Dedução de Deduio is a data protection law which requires compliance in regarda to processing of personal data. This policy detects Brazilian Fill such as passport numbers, drivers bilenos biumons, election f12 numbers, personal phone numbers, etc.',
      active: false,
      requestedDate: '2026-02-14',
    },
    {
      id: '4',
      rule_name: 'Preview: Sensitive Forms',
      rule_category: 'PHI',
      rule_desc:
        'Predefined 1 [Preview] [Policy Pack] Brazilian General Data Protection Axt & GPD - Lar Geral de Dedução de Deduio is a data protection law which requires compliance in regarda to processing of personal data. This policy detects Brazilian Fill such as passport numbers, drivers bilenos biumons, election f12 numbers, personal phone numbers, etc.',
      active: false,
      requestedDate: '2026-02-12',
    },
  ];

  // ✅ Working Data
  dataSource = [...this.originalData];

  searchText = '';
  selectedFilter = '';
  selectedSort = '';

  constructor(private router: Router) {}

  // 🔍 Search
  applyFilter(value: string) {
    this.searchText = value.toLowerCase();
    this.filterData();
  }

  // 🔄 Filter + Sort
  filterData() {
    let data = [...this.originalData];

    // Search
    if (this.searchText) {
      data = data.filter(
        (item) =>
          item.rule_name.toLowerCase().includes(this.searchText) ||
          item.rule_desc.toLowerCase().includes(this.searchText) ||
          item.id.toLowerCase().includes(this.searchText),
      );
    }

    // Category Filter
    if (this.selectedFilter) {
      data = data.filter((item) => item.rule_category === this.selectedFilter);
    }

    // Date Sort
    if (this.selectedSort === 'latest') {
      data.sort(
        (a, b) =>
          new Date(b.requestedDate).getTime() -
          new Date(a.requestedDate).getTime(),
      );
    } else if (this.selectedSort === 'oldest') {
      data.sort(
        (a, b) =>
          new Date(a.requestedDate).getTime() -
          new Date(b.requestedDate).getTime(),
      );
    }

    this.dataSource = data;
  }

  // 🔢 Count
  get filteredCount() {
    return this.dataSource.length;
  }

  get totalCount() {
    return this.originalData.length;
  }

  createSlug(userName: string): string {
    const fullName = `${userName}`;

    return fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
