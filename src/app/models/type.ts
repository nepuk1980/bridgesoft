// File System Interfaces
export interface FileSystemAccessSummaryInterface {
  sensitiveFoldersWithReadandExecuteOpenAccessPercentage: string;
  sensitivefoldersWithFullcontrolOpenAccess: number;
  sensitivefoldersWithFullcontrolOpenAccessPercentage: string;
  externalSourcesPercentage: string;
  foldersWithOpenAccessPercentage: string;
  sensitiveFoldersWithOpenAccessPercentage: string;
  externalSources: number;
  foldersThatContainsSensitiveFilesPercentage: string;
  foldersWithOpenAccess: number;
  cloudResourcesPercentage: string;
  sensitiveFoldersWithOpenAccess: number;
  staleSensitiveFiles: number;
  foldersThatContainsSensitiveFiles: number;
  staleSensitiveFilesPercentage: string;
  sensitiveFilesWithOpenAccessPercentage: string;
  cloudResources: number;
  sensitiveFoldersWithReadandExecuteOpenAccess: number;
  sensitiveFilesWithOpenAccess: number;
}

export interface TotalFileSystemAccessSummaryInterface {
  totalRecords: number;
  totalUniqueItems: number;
  totalFolders: number;
  totalFiles: number;
  sensitiveFoldersWithOpenAccess: number;
  sensitiveFilesWithOpenAccess: number;
  foldersThatContainsSensitiveFiles: number;
  sensitiveFoldersWithFullControlOpenAccess: number;
  foldersWithOpenAccess: number;
  staleSensitiveFiles: number;
  sensitiveFoldersWithReadandExecuteOpenAccess: number;
  externalSources: number;
  cloudResources: number;
  fileShareFiles: number;
  fileShareFolders: number;
  fileShareTotal: number;
  sharePointFiles: number;
  sharePointFolders: number;
  sharePointTotal: number;
}
export interface FileSystemResponseInterface {
  content: {
    cloudResource: boolean;
    createDatetime: string;
    external: boolean;
    folderContainsSensitiveFiles: boolean;
    fullControlOpenAccess: boolean;
    id: number;
    itemName: string;
    itemType: string;
    itemUrl: string;
    lastAccessedDatetime: string | null;
    lastModifiedDatetime: string;
    libraryName: string;
    openAccess: boolean;
    pathValue: string;
    readExecuteOpenAccess: boolean;
    ruleCategory: string;
    sensitive: boolean;
    sourceName: string;
    sourceType: string;
    stale: boolean;
  }[];

  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;

  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };

  size: number;

  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };

  totalElements: number;
  totalPages: number;
}

export type ApplicationResponseInterface = {
  content: {
    applicationHost: string;
    applicationName: string;
    applicationType: string;
    assignedRoleSummary: string;
    createDatetime: string;
    id: number;
    lastModifiedDatetime: string;
  }[];

  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;

  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };

  size: number;

  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };

  totalElements: number;
  totalPages: number;
};

export type IdentityVaultResponseInterface = {
  content: {
    assignedRoleSummary: string;
    company: string;
    createDatetime: string;
    department: string;
    email: string;
    employee_code: string;
    firstName: string;
    id: number;
    job_title: string;
    lastModifiedDatetime: string;
    lastName: string;
    location: string;
    manager: string;
    manager_department: string;
    manager_employee_id: string;
    riskScore: string;
  }[];

  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;

  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };

  size: number;

  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };

  totalElements: number;
  totalPages: number;
};

export type IdentityVaultDetailResponseInterface = {
  assignedRoleSummary: string;
  company: string;
  createDatetime: string;
  department: string;
  email: string;
  employee_code: string;
  firstName: string;
  id: number;
  job_title: string;
  lastModifiedDatetime: string;
  lastName: string;
  location: string;
  manager: string;
  manager_department: string;
  manager_employee_id: string;
  riskScore: string;
};

export type ApplicationAccountsResponseInterface = {
  accountName: string;
  appId: number;
  fsApplications: {
    applicationHost: string;
    applicationName: string;
    applicationType: string;
    assignedRoleSummary: string;
    createDatetime: string;
    id: number;
    lastModifiedDatetime: string;
  };
  id: number;
  lastAccess: string;
  status: string;
};

export interface RuleResponseInterface {
  id: number;
  ruleName: string;
  ruleDesc: string;
  active: boolean;
  ruleCategory: string;
  createDatetime: string | null;
  lastModifiedDatetime: string;
}
