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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf } from '@angular/common';

// Ensure the correct path to your service
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

  isLoading = false; // Controls the "Submit" button loader
  isFetchingUsers = true; // Controls the data-fetching spinner overlay
  searchTerm = '';

  availableUsers: DialogUserData[] = [];
  filteredUsers: DialogUserData[] = [];

  constructor(
    public dialogRef: MatDialogRef<AdduserdpopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.isFetchingUsers = true; // Show initial loader

    this.api.getlistofidentityvaults(0, 100, '', '').subscribe({
      next: (res: any) => {
        const users =
          res.content || res.data || (Array.isArray(res) ? res : []);

        const uniqueUsers: DialogUserData[] = [];
        const seenIdentifiers = new Set(); // Used to prevent duplicates

        users.forEach((u: any) => {
          // Deduplicate by email (fallback to ID)
          const uniqueKey = u.email || u.id;

          if (!seenIdentifiers.has(uniqueKey)) {
            seenIdentifiers.add(uniqueKey);
            uniqueUsers.push({
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email || 'No Email',
              selected: false,
            });
          }
        });

        this.availableUsers = uniqueUsers;
        this.filteredUsers = [...this.availableUsers];
        this.isFetchingUsers = false; // Hide loader
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isFetchingUsers = false; // Hide loader on error
      },
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.availableUsers;
    } else {
      this.filteredUsers = this.availableUsers.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(term),
      );
    }
  }

  hasSelectedUsers(): boolean {
    return this.availableUsers.some((u) => u.selected);
  }

  onSubmit() {
    const selectedUsers = this.availableUsers.filter((u) => u.selected);

    if (selectedUsers.length === 0) return;

    if (!this.data?.group?.id) {
      console.error('❌ No active group selected in the tree.');
      return;
    }

    this.isLoading = true; // Set button state to "Adding..."

    // Build the payload expecting array of objects matching Postman format
    const payload = selectedUsers.map((user) => ({
      groupId: this.data.group.id.toString(),
      groupName: this.data.group.name,
      userId: user.id.toString(),
      userName: `${user.firstName} ${user.lastName}`.trim(),
      status: 'New',
    }));

    this.api.addUserToGroup(payload).subscribe({
      next: (res) => {
        // Show success message
        this.showMessage('User(s) added successfully');

        // Wait 1 second for the snackbar to be read, then close the dialog
        setTimeout(() => {
          this.isLoading = false;
          this.dialogRef.close(true); // Tell parent to refresh
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
      panelClass: ['success-snackbar'], // Make sure to define this in global styles.css!
    });
  }
}
