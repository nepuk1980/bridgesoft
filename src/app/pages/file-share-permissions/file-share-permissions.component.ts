import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

type SectionKey = 'googleWorkspace' | 'sharePointOneDrive' | 'aws';

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

  // ✅ MODEL (final structure)
  model: Record<SectionKey, any> = {
    googleWorkspace: {},
    sharePointOneDrive: {},
    aws: {},
  };

  // ✅ FORM CONFIG
  formData: {
    title: string;
    key: SectionKey;
    fields: { label: string; key: string; type: string }[];
  }[] = [
    {
      title: 'Google Workspace (G Suite/Drive)',
      key: 'googleWorkspace',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        {
          label: 'Service Account Key',
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
      title: 'SharePoint & OneDrive',
      key: 'sharePointOneDrive',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        {
          label: 'Azure App Registration',
          key: 'azureAppRegistration',
          type: 'text',
        },
        {
          label: 'Client Secret',
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
      title: 'AWS',
      key: 'aws',
      fields: [
        { label: 'Base URL', key: 'baseUrl', type: 'text' },
        { label: 'IAM Role ARN', key: 'iamUserRoleArn', type: 'text' },
        { label: 'IAM Policy', key: 'iamPolicyPermissions', type: 'text' },
        { label: 'Description', key: 'description', type: 'textarea' },
        { label: 'Access Key', key: 'accessKey', type: 'text' },
        { label: 'External ID', key: 'externalId', type: 'text' },
        { label: 'S3 Buckets', key: 's3BucketList', type: 'text' },
      ],
    },
  ];

  ngOnInit() {
    this.appId = history.state?.id;

    if (!this.appId) {
      console.error('❌ No ID found');
      this.router.navigate(['/applications']);
      return;
    }

    this.getDetails();
  }

  // ✅ SAFE GET
  getField(section: SectionKey, field: string) {
    return this.model?.[section]?.[field] ?? '';
  }

  // ✅ SAFE SET
  setField(section: SectionKey, field: string, value: any) {
    if (!this.model[section]) {
      this.model[section] = {};
    }
    this.model[section][field] = value;
  }

  // ✅ API CALL (FIXED 🔥)
  getDetails() {
    this.api.getapplicationdetails(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.data || res; // 🔥 important fix

        console.log('API DATA:', data);

        this.model = {
          googleWorkspace: {
            baseUrl: data.googleBaseUrl || '',
            serviceAccountKey: data.googleServiceAccountKey || '',
            domainWideDelegation: data.googleDomainWideDelegation || '',
            description: data.googleDescription || '',
            oauthScopes: data.googleOauthScopes || '',
            adminEmail: data.googleAdminEmail || '',
          },
          sharePointOneDrive: {
            baseUrl: data.sharepointBaseUrl || '',
            description: data.sharepoint_description || '',
            azureAppRegistration: data.sharepointAzureAppRegistration || '',
            tenantId: data.sharepointTenantId || '',
            siteUrl: data.sharepointSiteUrl || '',
            clientSecretOrCertificate: data.sharepointClientSecret || '',
            apiPermission: data.sharepointApiPermission || '',
          },
          aws: {
            baseUrl: data.awsBaseUrl || '',
            description: data.awsDescription || '',
            iamUserRoleArn: data.awsIamUser || '',
            accessKey: data.awsAccessKey || '',
            s3BucketList: data.awsS3BucketList || '',
            iamPolicyPermissions: data.awsIamPolicyPermission || '',
            externalId: data.awsExternalId || '',
          },
        };
      },
      error: (err) => {
        console.error('❌ API Error:', err);
      },
    });
  }

  // ✅ SAVE
  save() {
    const payload = {
      // ✅ REQUIRED IDs
      appId: this.appId,
      id: this.appId,

      // GOOGLE
      googleBaseUrl: this.getField('googleWorkspace', 'baseUrl'),
      googleServiceAccountKey: this.getField(
        'googleWorkspace',
        'serviceAccountKey',
      ),
      googleDomainWideDelegation: this.getField(
        'googleWorkspace',
        'domainWideDelegation',
      ),
      googleDescription: this.getField('googleWorkspace', 'description'),
      googleOauthScopes: this.getField('googleWorkspace', 'oauthScopes'),
      googleAdminEmail: this.getField('googleWorkspace', 'adminEmail'),

      // SHAREPOINT
      sharepointBaseUrl: this.getField('sharePointOneDrive', 'baseUrl'),
      sharepoint_description: this.getField(
        'sharePointOneDrive',
        'description',
      ),
      sharepointAzureAppRegistration: this.getField(
        'sharePointOneDrive',
        'azureAppRegistration',
      ),
      sharepointTenantId: this.getField('sharePointOneDrive', 'tenantId'),
      sharepointSiteUrl: this.getField('sharePointOneDrive', 'siteUrl'),
      sharepointClientSecret: this.getField(
        'sharePointOneDrive',
        'clientSecretOrCertificate',
      ),
      sharepointApiPermission: this.getField(
        'sharePointOneDrive',
        'apiPermission',
      ),

      // AWS
      awsBaseUrl: this.getField('aws', 'baseUrl'),
      awsDescription: this.getField('aws', 'description'),
      awsIamUser: this.getField('aws', 'iamUserRoleArn'),
      awsAccessKey: this.getField('aws', 'accessKey'),
      awsS3BucketList: this.getField('aws', 's3BucketList'),
      awsIamPolicyPermission: this.getField('aws', 'iamPolicyPermissions'),
      awsExternalId: this.getField('aws', 'externalId'),
    };

    console.log('📦 FINAL PAYLOAD:', payload); // ✅ DEBUG

    this.api.updateApplicationDetails(this.appId, payload).subscribe({
      next: () => {
        console.log('✅ Saved');
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        console.error('❌ Save Error:', err);
      },
    });
  }
}
