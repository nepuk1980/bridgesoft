import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf } from '@angular/common';

import { ApiService } from '../../../services/api.service';

export interface DialogUserData {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  selected?: boolean;
}

@Component({
  selector: 'app-adduserdpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormsModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './adduserdpopup.component.html',
  styleUrl: './adduserdpopup.component.css',
})
export class AdduserdpopupComponent implements OnInit {
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  isLoading = false;
  isFetchingUsers = false;
  searchTerm = '';

  availableUsers: DialogUserData[] = [];
  filteredUsers: DialogUserData[] = [];

  selectedUsersCache = new Map<string | number, DialogUserData>();

  // --- Continuous Scroll State Tracking ---
  pageIndex = 0;
  pageSize = 10;
  hasMoreData = true;
  totalElements = 0;

  constructor(
    public dialogRef: MatDialogRef<AdduserdpopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.loadUsersData(false);
    console.log('Incoming Dialog Group Context:', this.data);
  }

  // MAIN DATA LOADER
  loadUsersData(append: boolean = false) {
    if (!append) {
      this.pageIndex = 0;
      this.hasMoreData = true;
    }

    this.isFetchingUsers = true;

    // 🌟 FIX: Pass 'this.searchTerm' to the third parameter to enable server-side searching
    this.api
      .getlistofidentityvaults(
        this.pageIndex,
        this.pageSize,
        this.searchTerm,
        '',
      )
      .subscribe({
        next: (res: any) => {
          const users =
            res.content || res.data || (Array.isArray(res) ? res : []);

          this.totalElements = res.totalElements ?? users.length;
          this.hasMoreData = users.length >= this.pageSize;

          const mappedUsers: DialogUserData[] = users.map((u: any) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email || 'No Email',
            selected: this.selectedUsersCache.has(u.id),
          }));

          if (append) {
            this.availableUsers = [...this.availableUsers, ...mappedUsers];
          } else {
            this.availableUsers = mappedUsers;
          }

          // Render updates directly to the template view container
          this.filteredUsers = this.availableUsers;
          this.isFetchingUsers = false;
        },
        error: (err) => {
          console.error('Failed to load users', err);
          this.isFetchingUsers = false;
        },
      });
  }

  // INFINITE SCROLL TRIGGER
  onScroll(event: any): void {
    const element = event.target;
    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    if (atBottom && this.hasMoreData && !this.isFetchingUsers) {
      this.pageIndex++;
      this.loadUsersData(true);
    }
  }

  toggleUserSelection(user: DialogUserData) {
    if (user.selected) {
      this.selectedUsersCache.set(user.id, user);
    } else {
      this.selectedUsersCache.delete(user.id);
    }
  }

  // 🌟 FIX: Upgraded to trigger a clean backend fetch when users use the search input box
  filterUsers() {
    this.pageIndex = 0;
    this.hasMoreData = true;
    this.loadUsersData(false);
  }

  hasSelectedUsers(): boolean {
    return this.selectedUsersCache.size > 0;
  }

  onSubmit() {
    const selectedUsers = Array.from(this.selectedUsersCache.values());
    if (selectedUsers.length === 0) return;

    // 🌟 FIX: Allow validation checking to pass if either a Group ID OR Group Name context exists
    const hasGroupContext = !!this.data?.group?.id || !!this.data?.group?.name;

    if (!hasGroupContext) {
      this.showMessage('Error: No active group context found.');
      console.error('❌ No active group selected in the tree structure.');
      return;
    }

    this.isLoading = true;

    // Assemble payload cleanly with safe-navigation fallback strings
    const payload = selectedUsers.map((user) => ({
      groupId: this.data.group?.id ? this.data.group.id.toString() : '',
      groupName: this.data.group?.groupName || this.data.group?.name || '',
      userId: user.id ? user.id.toString() : '',
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      status: 'New',
    }));

    console.log('Submitting Add User to Group Payload:', payload);

    this.api.addUserToGroup(payload).subscribe({
      next: () => {
        this.showMessage('User(s) added successfully');
        setTimeout(() => {
          this.isLoading = false;
          this.dialogRef.close(true); // Return true to trigger the structural layout view updates
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage('Failed to add user(s)');
        console.error('❌ Failed to add user/s:', err);
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
}
