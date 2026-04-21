// File System Interfaces
export interface FileSystemAccessSummaryInterface {
  fileShareFolders: number;
  sensitiveFoldersWithReadandExecuteOpenAccessPercentage: string;
  sensitivefoldersWithFullcontrolOpenAccess: number;
  sensitivefoldersWithFullcontrolOpenAccessPercentage: string;
  externalSourcesPercentage: string;
  foldersWithOpenAccessPercentage: string;
  sensitiveFoldersWithOpenAccessPercentage: string;
  externalSources: number;
  foldersThatContainsSensitiveFilesPercentage: string;
  sharePointFiles: number;
  fileShareTotal: number;
  foldersWithOpenAccess: number;
  sharePointTotal: number;
  cloudResourcesPercentage: string;
  sharePointFolders: number;
  sensitiveFoldersWithOpenAccess: number;
  staleSensitiveFiles: number;
  foldersThatContainsSensitiveFiles: number;
  staleSensitiveFilesPercentage: string;
  fileShareFiles: number;
  sensitiveFilesWithOpenAccessPercentage: string;
  cloudResources: number;
  sensitiveFoldersWithReadandExecuteOpenAccess: number;
  sensitiveFilesWithOpenAccess: number;
}

export interface FileSystemResponseInterface {
  content: {
    id: number;
    sourceType: string;
    sourceName: string;
    libraryName: string;
    itemName: string;
    pathValue: string;
    itemType: string;
    itemUrl: string;
    groupsList: string;
    createDatetime: string; // ISO datetime string
    lastModifiedDatetime: string; // ISO datetime string
    lastAccessedDatetime: string | null;
    sensitive: boolean;
    openAccess: boolean;
    fullControlOpenAccess: boolean;
    readExecuteOpenAccess: boolean;
    external: boolean;
    cloudResource: boolean;
    stale: boolean;
    folderContainsSensitiveFiles: boolean;
    ruleCategory: string;
    category: string;
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
