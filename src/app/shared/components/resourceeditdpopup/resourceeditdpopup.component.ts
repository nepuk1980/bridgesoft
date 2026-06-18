import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-resourceeditdpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    FormsModule,
  ],
  templateUrl: './resourceeditdpopup.component.html',
  styleUrls: ['./resourceeditdpopup.component.css'],
})
export class ResourceeditdpopupComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ResourceeditdpopupComponent>);
  private api = inject(ApiService);

  // Inject the passed data containing element row info and active context
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  displayName = 'Unknown';
  isGroup = true;
  isLoading = false;

  // Local state for checking/unchecking boxes
  permissionsModel = {
    fullControl: false,
    modify: false,
    readExecute: false,
    listContent: false,
    read: false,
    write: false,
  };

  ngOnInit(): void {
    console.log('get edit data ', this.data);
    if (!this.data) return;

    const ctx = this.data.context;
    const row = this.data.element;

    // 1. Resolve Display Name for the Chip
    if (ctx?.groupName) {
      this.displayName = ctx.groupName;
      this.isGroup = true;
    } else if (ctx?.userName) {
      this.displayName = ctx.userName;
      this.isGroup = false;
    } else if (row?.directory) {
      this.displayName = row.directory;
    }

    // 2. Map existing permissions to checkboxes as defaults
    if (row?.permissions) {
      this.permissionsModel.fullControl = !!row.permissions.F;
      this.permissionsModel.modify = !!row.permissions.M;
      this.permissionsModel.read = !!row.permissions.R;
      this.permissionsModel.write = !!row.permissions.W;
      this.permissionsModel.readExecute = !!row.permissions.X;
      // If your row data explicitly includes list folder content flags, set it here
      this.permissionsModel.listContent = !!row.permissions.X;
    }
  }

  onApplyUpdate(): void {
    const row = this.data?.element;
    const ctx = this.data?.context;
    if (!row) return;

    this.isLoading = true;

    // 3. Reassemble strings based on active UI selections
    const selectedPermissions: string[] = [];
    if (this.permissionsModel.fullControl)
      selectedPermissions.push('Full Control');
    if (this.permissionsModel.modify) selectedPermissions.push('Modify');
    if (this.permissionsModel.readExecute)
      selectedPermissions.push('Read & Execute');
    if (this.permissionsModel.listContent)
      selectedPermissions.push('List Folder Content');
    if (this.permissionsModel.read) selectedPermissions.push('Read');
    if (this.permissionsModel.write) selectedPermissions.push('Write');

    const finalPermissionsString = selectedPermissions.join(', ') || 'Read';

    // 4. Match the exact payload specification mapping rules
    const payload = [
      {
        id: row.id ? Number(row.id) : null,
        groupId: ctx?.groupId,
        groupName: ctx?.groupName,
        folderId: row.id ? Number(row.id) : null,
        folderName: row.name || '', // UI folderName maps to itemName
        userId: ctx?.userId,
        userName: ctx?.userName,
        fileSystemPermissions: finalPermissionsString,
        totalHitCount: row.totalHitCount ? Number(row.totalHitCount) : 0,
        folderFileSize: row.size || '-',
        classification: row.classification || '-',
        accessAction: 'Update', // Hardcoded value
        status: 'New', // Hardcoded value
      },
    ];

    console.log('edit payload', payload);

    this.api.updatefolderorfiletothegrouporuser(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true); // Return true to trigger view refresh
      },
      error: (err) => {
        console.error('❌ Failed to update permissions:', err);
        this.isLoading = false;
      },
    });
  }
}
