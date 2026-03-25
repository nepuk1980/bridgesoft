import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-file-share-permissions',
  standalone: true,
  imports: [
    CommonModule,
    InnerheaderComponent,
    MatButtonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './file-share-permissions.component.html',
  styleUrl: './file-share-permissions.component.css',
})
export class FileSharePermissionsComponent implements OnInit {
  appId!: number;

  constructor(
    private router: Router,
    private api: ApiService,
  ) {}

  // ✅ Initialize model to avoid undefined errors
  model: any = {
    googleWorkspace: {},
    sharePointOneDrive: {},
    aws: {},
  };

  // ✅ Form structure
  formData = [
    {
      title: 'Google Workspace (G Suite/Drive)',
      key: 'googleWorkspace',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        {
          label: 'Service Account Key (JSON)',
          key: 'serviceAccountKey',
          type: 'text',
        },
        {
          label: 'Domain-Wide Delegation',
          key: 'domainWideDelegation',
          type: 'text',
        },
        { label: 'Description', key: 'description', type: 'textarea' },
        { label: 'OAuth Scopes', key: 'oauthScopes', type: 'text' },
        { label: 'Admin Email', key: 'adminEmail', type: 'email' },
      ],
    },
    {
      title: 'SharePoint Online & OneDrive',
      key: 'sharePointOneDrive',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        {
          label: 'Azure App Registration',
          key: 'azureAppRegistration',
          type: 'text',
        },
        {
          label: 'Client Secret / Certificate',
          key: 'clientSecretOrCertificate',
          type: 'text',
        },
        { label: 'Description', key: 'description', type: 'textarea' },
        { label: 'Tenant ID', key: 'tenantId', type: 'text' },
        { label: 'API Permission', key: 'apiPermission', type: 'text' },
        { label: 'Site URL', key: 'siteUrl', type: 'text' },
      ],
    },
    {
      title: 'AWS (Amazon Web Services)',
      key: 'aws',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        { label: 'IAM User/Role ARN', key: 'iamUserRoleArn', type: 'text' },
        {
          label: 'IAM Policy Permissions',
          key: 'iamPolicyPermissions',
          type: 'text',
        },
        { label: 'Description', key: 'description', type: 'textarea' },
        {
          label: 'Access Key ID & Secret Access Key',
          key: 'accessKey',
          type: 'text',
        },
        { label: 'External ID', key: 'externalId', type: 'text' },
        { label: 'S3 Bucket List', key: 's3BucketList', type: 'text' },
      ],
    },
  ];

  ngOnInit() {
    this.appId = history.state.id;

    if (this.appId) {
      this.getDetails();
    } else {
      console.error('No ID found');
    }
  }

  // ✅ API call + mapping
  getDetails() {
    this.api.getapplicationdetails(this.appId).subscribe({
      next: (res: any) => {
        this.model = {
          googleWorkspace: {
            baseUrl: res.googleBaseUrl || '',
            serviceAccountKey: res.googleServiceAccountKey || '',
            domainWideDelegation: res.googleDomainWideDelegation || '',
            description: res.googleDescription || '',
            oauthScopes: res.googleOauthScopes || '',
            adminEmail: res.googleAdminEmail || '',
          },

          sharePointOneDrive: {
            baseUrl: res.sharepointBaseUrl || '',
            description: res.sharepoint_description || '',
            azureAppRegistration: res.sharepointAzureAppRegistration || '',
            tenantId: res.sharepointTenantId || '',
            siteUrl: res.sharepointSiteUrl || '',
            clientSecretOrCertificate: res.sharepointClientSecret || '',
            apiPermission: res.sharepointApiPermission || '',
          },

          aws: {
            baseUrl: res.awsBaseUrl || '',
            description: res.awsDescription || '',
            iamUserRoleArn: res.awsIamUser || '',
            accessKey: res.awsAccessKey || '',
            s3BucketList: res.awsS3BucketList || '',
            iamPolicyPermissions: res.awsIamPolicyPermission || '',
            externalId: res.awsExternalId || '',
          },
        };
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // ✅ Save handler
  save() {
    console.log('Saved successfully', this.model);

    // ✅ Navigate AFTER success
    // this.router.navigate(['/applications']);
  }
}
