import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CardComponent } from '../shared/components/card/card.component';
import { FilefolderpopupComponent } from '../shared/components/filefolderpopup/filefolderpopup.component';

export interface Folder {
  name: string;
  category: string;
  created: string;
}

interface CardData {
  title: string;
  value: number | string;
  file: boolean;
  fileicon: boolean;
  icon: string;
  subtitle?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private dialog = inject(MatDialog);

  // Folder datasets
  FOLDER_DATA_1: Folder[] = [
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  FOLDER_DATA_2: Folder[] = [
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  FOLDER_DATA_3: Folder[] = [
     { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
    { name: 'Anti-Bribery Policy', category: 'PIL', created: '12 / 04 / 2025' },
    {
      name: 'Conflict of Interest',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    {
      name: 'Professional Behaviour',
      category: 'PIL',
      created: '12 / 04 / 2025',
    },
    {
      name: 'Whistleblower Policy',
      category: 'HIPAA',
      created: '11 / 03 / 2025',
    },
    { name: 'Salary & Payroll', category: 'PIL', created: '12 / 04 / 2025' },
    { name: 'Bonus & Incentive', category: 'HIPAA', created: '11 / 03 / 2024' },
    {
      name: 'Performance Appraisal',
      category: 'PIL',
      created: '12 / 04 / 2024',
    },
    { name: 'Reimbursement', category: 'HIPAA', created: '11 / 03 / 2024' },
    { name: 'Travel & Expense', category: 'PIL', created: '12 / 04 / 2024' },
    {
      name: 'Insurance & Mediclaim',
      category: 'HIPAA',
      created: '11 / 03 / 2024',
    },
  ];

  openDialog(card: CardData, folders: Folder[]) {
    this.dialog.open(FilefolderpopupComponent, {
      width: '58rem',
      minWidth: '58rem',
      maxWidth: '100%',
      data: {
        ...card,
        folders: folders,
      },
    });
  }
}
