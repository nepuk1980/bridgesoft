import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-share-permissions',
  standalone: true,
  imports: [
    CommonModule,
    InnerheaderComponent,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './file-share-permissions.component.html',
  styleUrl: './file-share-permissions.component.css'
})
export class FileSharePermissionsComponent implements OnInit {

  formData = [
    {
      title: "Google Workspace (G Suite/Drive)",
      key: "googleWorkspace",
      fields: [
        { label: "Base URL", key: "baseUrl", type: "text" },
        { label: "Service Account Key (JSON)", key: "serviceAccountKey", type: "text" },
        { label: "Domain-Wide Delegation", key: "domainWideDelegation", type: "text" },
        { label: "Description", key: "description", type: "textarea" },
        { label: "OAuth Scopes", key: "oauthScopes", type: "text" },
        { label: "Admin Email", key: "adminEmail", type: "email" }
      ]
    },
    {
      title: "SharePoint Online & OneDrive",
      key: "sharePointOneDrive",
      fields: [
        { label: "Base URL", key: "baseUrl", type: "text" },
        { label: "Azure App Registration", key: "azureAppRegistration", type: "text" },
        { label: "Client Secret / Certificate", key: "clientSecretOrCertificate", type: "text" },
        { label: "Description", key: "description", type: "textarea" },
        { label: "Tenant ID", key: "tenantId", type: "text" },
        { label: "API Permission", key: "apiPermission", type: "text" },
        { label: "Site URL", key: "siteUrl", type: "text" },
      ]
    },
    {
      title: "AWS (Amazon Web Services)",
      key: "aws",
      fields: [
        { label: "Base URL", key: "baseUrl", type: "text" },
        { label: "IAM User/Role ARN", key: "iamUserRoleArn", type: "text" },
        { label: "IAM Policy Permissions", key: "iamPolicyPermissions", type: "text" },
        { label: "Description", key: "description", type: "textarea" },
        { label: "Access Key ID & Secret Access Key", key: "accessKey", type: "text" },
        { label: "External ID", key: "externalId", type: "text" },
        { label: "S3 Bucket List", key: "s3BucketList", type: "text" },
      ]
    }
  ];

  model: any = {};

  ngOnInit() {
    this.model = {
      googleWorkspace: {
        baseUrl: 'https://qa-service.googlesuite.com/',
          serviceAccountKey: '{ "type": "service_account", "project_id": "company-workspace-project" }',
 domainWideDelegation: 'https://www.googleapis.com/auth/drive',
        description: 'A comprehensive, cloud-based suite of productivity and collaboration tools developed by Google, designed for businesses, education, and teams to create, store, and share content.',
      
        oauthScopes: 'https://www.googleapis.com/auth/calendar.readonly',
       
        adminEmail: 'fileshare.administrator@bridgesoft.com'
      },
      sharePointOneDrive: {
        baseUrl: 'https://qa-service.sharepoint.com/',
        description: 'Designed for team collaboration, project management, storing shared organizational data.',
        azureAppRegistration: 'email, profile',
        tenantId: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2g3h4i5j6',
        siteUrl: 'https://<app-name>.<random-string>.web.core.windows.net',
        clientSecretOrCertificate: 'System.Security.Cryptography.X509Certificates',
        apiPermission: 'PrincipalId = $clientServicePrincipalId'
      },
      aws: {
        baseUrl: 'https://qa-service.aws.com/',
        description: 'AWS allows users to offload operational burdens, such as managing physical servers, allowing for faster innovation and scalability.',
        iamUserRoleArn: 'arn:aws:iam::123456789012:user/Alice',
        accessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        s3BucketList: '2026-01-17 10:45:00 logs-and-backups',
        iamPolicyPermissions: 'arn:aws:s3:::my_bucket_name/*',
        externalId: 'a1b2c3d4-5678-90ab-cdef-11111FILESHARE'
      }
    };
  }

  save() {
    console.log('Final Payload:', this.model);
  }
}