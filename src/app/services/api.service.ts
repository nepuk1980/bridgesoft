import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AlertInterface,
  AllFilesByGroupResponse,
  ApplicationAccountsResponseInterface,
  ApplicationResponseInterface,
  AuditResponseInterface,
  ExecutiveAuditReportsInterface,
  ExternalResourcesGroupByResponse,
  FileSystemAccessSummaryInterface,
  FileSystemResponseInterface,
  GetADGroupInterface,
  GetAllFoldersResponse,
  GetUsersByGroupNameResponse,
  GroupFolderPermissionResponse,
  IdentityVaultCategoryResponse,
  IdentityVaultDetailResponseInterface,
  IdentityVaultResponseInterface,
  NotificationInterface,
  RequestAccessWorkflowInterface,
  ReviewAccessInterface,
  RuleResponseInterface,
  UserFolderPermissionResponse,
} from '../models/type';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }
  private authService = inject(AuthService);

  // ✅ Summary API
  getfilesystemaccesspermissionsummary(): Observable<FileSystemAccessSummaryInterface> {
    return this.http.get<FileSystemAccessSummaryInterface>(
      `${environment.fasmUrl}/getfilesystemaccesspermissionsummary`,
    );
  }
  // windows file
  getfilesharefiledetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getfilesharefiledetails`,
      { params },
    );
  }

  // windows folder
  getfilesharefolderdetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getfilesharefolderdetails`,
      { params },
    );
  }

  // windows total
  getfilesharetotaldetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getfilesharetotaldetails`,
      { params },
    );
  }

  // share point file
  getsharepointfiledetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getsharepointfiledetails`,
      { params },
    );
  }

  // share point folder
  getsharepointfolderdetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getsharepointfolderdetails`,
      { params },
    );
  }

  // share point total
  getsharepointtotaldetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getsharepointtotaldetails`,
      { params },
    );
  }

  // ✅ Details API
  getFilesystemAccessPermissionDetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
    searchFileOrFolderName: string,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size)
      .set('searchFileOrFolderName', searchFileOrFolderName);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.fasmUrl}/getfilesystemaccesspermissiondetails`,
      { params },
    );
  }

  // External Chart
  getExternalResourcesGroupBy() {
    return this.http.get<ExternalResourcesGroupByResponse>(
      `${environment.fasmUrl}/getExternalResourcesGroupBy`,
    );
  }

  // ✅ Applications List
  getlistofapplications(
    page: number = 0,
    size: number = 10,
  ): Observable<ApplicationResponseInterface> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<ApplicationResponseInterface>(
      `${environment.fasmUrl}/getlistofapplications`,
      { params },
    );
  }

  // ✅ Application Details
  getapplicationdetails(appId: number): Observable<any> {
    const params = new HttpParams().set('appId', appId);

    return this.http.get<any>(`${environment.fasmUrl}/getapplicationdetails`, {
      params,
    });
  }

  // ✅ Identity Vault Details
  getidentityvaultdetails(
    id: number,
  ): Observable<IdentityVaultDetailResponseInterface> {
    const params = new HttpParams().set('id', id);

    return this.http.get<IdentityVaultDetailResponseInterface>(
      `${environment.fasmUrl}/getidentityvaultdetails`,
      { params },
    );
  }
  // ✅ Identity Vault Application Details
  getapplicationaccount(
    id: number,
  ): Observable<ApplicationAccountsResponseInterface> {
    const params = new HttpParams().set('vaultId', id);

    return this.http.get<ApplicationAccountsResponseInterface>(
      `${environment.fasmUrl}/getidentityapplicationaccountlist`,
      { params },
    );
  }

  // ✅ Request Access workflow
  getAllFilesAndFoldersDetails(
    searchFileOrFolderName: string = '',
    category: string = '',
    filter: string = '',
    page: number = 0,
    size: number = 10,
  ): Observable<RequestAccessWorkflowInterface> {
    let params = new HttpParams()
      .set('searchFileOrFolderName', searchFileOrFolderName)
      .set('category', category)
      .set('filter', filter)
      .set('page', page)
      .set('size', size);

    return this.http.get<RequestAccessWorkflowInterface>(
      `${environment.fasmUrl}/getallfilesandfoldersdetails`,
      { params },
    );
  }

  // Request Access Workflow Update data
  saveaccessrequestdetails(data: any): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // ✅ DO NOT spread — send as-is
    console.log('🚀 FINAL PAYLOAD:', data);

    return this.http.post(
      `${environment.fasmUrl}/saveaccessrequestdetails`,
      data, // ✅ direct object
      { headers },
    );
  }

  // ✅ Identity Vault Application Details
  getidentityentitlementlist(
    id: number,
  ): Observable<ApplicationAccountsResponseInterface> {
    const params = new HttpParams().set('vaultId', id);

    return this.http.get<ApplicationAccountsResponseInterface>(
      `${environment.fasmUrl}/getidentityentitlementlist`,
      { params },
    );
  }

  updateApplicationDetails(id: number, data: any): Observable<any> {
    const token = this.authService.getToken();

    // ❌ Stop if no token
    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ dynamic token
      'Content-Type': 'application/json',
    });

    const payload = {
      appId: id,
      id: id, // ✅ IMPORTANT (backend expects this)
      ...data,
    };

    console.log('🚀 FINAL PAYLOAD:', payload);

    return this.http.put(
      `${environment.fasmUrl}/updateapplicationdetails`,
      payload,
      { headers },
    );
  }

  // ✅ Identity Vault List
  getrules(
    filter: string,
    sortByDate: 'Asc' | 'Desc' = 'Desc',
  ): Observable<RuleResponseInterface[]> {
    const params = new HttpParams()
      .set('filter', filter)
      .set('sortByDate', sortByDate);

    return this.http.get<RuleResponseInterface[]>(
      `${environment.fasmUrl}/getrules`,
      { params },
    );
  }

  updaterule(id: number, data: any): Observable<any> {
    const token = this.authService.getToken();

    // ❌ Stop if no token
    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ dynamic token
      'Content-Type': 'application/json',
    });

    const payload = {
      appId: id,
      id: id, // ✅ IMPORTANT (backend expects this)
      ...data,
    };

    console.log('🚀 FINAL PAYLOAD:', payload);

    return this.http.put(`${environment.fasmUrl}/updaterule`, payload, {
      headers,
    });
  }

  // Review Access Important List
  getlistofimportantaccessrequests(
    category: string,
    filter: string,
  ): Observable<ReviewAccessInterface[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('filter', filter);

    return this.http.get<ReviewAccessInterface[]>(
      `${environment.fasmUrl}/getlistofimportantaccessrequests`,
      { params },
    );
  }

  // Review Access Open List
  getlistofopenaccessrequests(
    category: string,
    filter: string,
  ): Observable<ReviewAccessInterface[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('filter', filter);

    return this.http.get<ReviewAccessInterface[]>(
      `${environment.fasmUrl}/getlistofopenaccessrequests`,
      { params },
    );
  }

  // Review Access Review List
  getlistofreviewaccessrequests(
    category: string,
    filter: string,
  ): Observable<ReviewAccessInterface[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('filter', filter);

    return this.http.get<ReviewAccessInterface[]>(
      `${environment.fasmUrl}/getlistofreviewaccessrequests`,
      { params },
    );
  }

  // Review Access Important List Update
  updateAccessRequestDetails(
    ids: number[],
    status: 'Approved' | 'Rejected',
  ): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const payload = {
      ids,
      status,
    };

    console.log('🚀 BULK PAYLOAD:', payload);

    return this.http.put(
      `${environment.fasmUrl}/updateaccessrequestdetails`,
      payload,
      { headers },
    );
  }

  // Audit Trail
  getaudittrail(
    searchEmployeeName: string,
    filter: string,
    page: number,
    size: number,
  ): Observable<AuditResponseInterface> {
    let params = new HttpParams()
      .set('searchEmployeeName', searchEmployeeName || '')
      .set('filter', filter || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AuditResponseInterface>(
      `${environment.fasmUrl}/getaudittrail`,
      { params },
    );
  }

  // Reports
  getexecutiveauditreport(
    searchEmployeeName: string,
    executiveEmail: string, // ✅ Updated parameter list
    filter: string,
    page: number,
    size: number,
  ): Observable<ExecutiveAuditReportsInterface> {
    let params = new HttpParams()
      .set('searchEmployeeName', searchEmployeeName || '')
      .set('executiveEmail', executiveEmail || '') // ✅ Bound parameter
      .set('filter', filter || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ExecutiveAuditReportsInterface>(
      `${environment.fasmUrl}/getexecutiveauditreport`,
      { params },
    );
  }

  // Notification
  getgetnotifications(
    page: number,
    size: number,
  ): Observable<NotificationInterface> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<NotificationInterface>(
      `${environment.fasmUrl}/getnotifications`,
      { params },
    );
  }

  // Alert
  getalerts(page: number, size: number): Observable<AlertInterface> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AlertInterface>(`${environment.fasmUrl}/getalerts`, {
      params,
    });
  }

  // Save Alert
  saveAlertDetails(data: any): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('🚀 FINAL PAYLOAD:', data);

    // By setting responseType to 'text', HttpClient will treat the
    // response as a string instead of trying to parse it as JSON.
    return this.http.post(`${environment.fasmUrl}/savealert`, data, {
      headers,
      responseType: 'text',
    });
  }

  // Update Alert
  updateAlertDetails(data: any): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('🚀 FINAL PAYLOAD:', data);

    // Using .put() to match the Postman request, sending the full object
    // as the request body.
    return this.http.put(`${environment.fasmUrl}/updatealert`, data, {
      headers,
      responseType: 'text',
    });
  }

  deleteAlert(alertId: number): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log(`🚀 Sending PUT request to delete alert ID: ${alertId}`);

    // Using .put() to match your Postman request requirements
    // Note: If the backend expects a body for this DELETE/PUT,
    // pass it as the 3rd argument, otherwise null is sufficient.
    return this.http.put(`${environment.fasmUrl}/deletealert/${alertId}`, null, {
      headers,
      responseType: 'text',
    });
  }

  // Add

  // ✅ Identity Vault Application Details
  getadgroups(
    groupName: string,
    page: number,
    size: number,
  ): Observable<GetADGroupInterface> {
    const params = new HttpParams()
      .set('groupName', groupName || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<GetADGroupInterface>(
      `${environment.fasmUrl}/getadgroups`,
      {
        params,
      },
    );
  }

  // Get Data Group Node
  getgroupfoldersorfiles(
    groupName: string,
    page: number,
    size: number,
  ): Observable<GroupFolderPermissionResponse> {
    const params = new HttpParams()
      .set('groupName', groupName || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<GroupFolderPermissionResponse>(
      `${environment.fasmUrl}/getgroupfoldersorfiles`,
      {
        params,
      },
    );
  }

  // Get Data Group User
  getuserfoldersorfiles(
    userName: string,
    page: number,
    size: number,
  ): Observable<UserFolderPermissionResponse> {
    const params = new HttpParams()
      .set('userName', userName || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<UserFolderPermissionResponse>(
      `${environment.fasmUrl}/getuserfoldersorfiles`,
      {
        params,
      },
    );
  }

  // getusersbygroupname
  getusersbygroupname(
    searchFirstNameOrLastName: string,
    groupName: string,
    page: number,
    size: number,
  ): Observable<GetUsersByGroupNameResponse> {
    const params = new HttpParams()
      .set('searchFirstNameOrLastName', searchFirstNameOrLastName || '')
      .set('groupName', groupName || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<GetUsersByGroupNameResponse>(
      `${environment.fasmUrl}/getusersbygroupname`,
      {
        params,
      },
    );
  }

  // ✅ Identity Vault List
  getlistofidentityvaults(
    page: number = 0,
    size: number = 10,
    searchFirstNameOrLastName: string = '',
    filter: string = '',
  ): Observable<IdentityVaultResponseInterface> {
    let params = new HttpParams()
      .set(
        'searchFirstNameOrLastName',
        (searchFirstNameOrLastName || '').trim(),
      )
      .set('filter', (filter || '').trim())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<IdentityVaultResponseInterface>(
      `${environment.fasmUrl}/getlistofidentityvaults`,
      { params },
    );
  }

  // getallfilesbygroup
  getallfilesbygroup(
    groupName: string,
    page: number,
    size: number,
  ): Observable<AllFilesByGroupResponse> {
    const params = new HttpParams()
      .set('groupName', groupName || '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AllFilesByGroupResponse>(
      `${environment.fasmUrl}/getallfilesbygroup`,
      {
        params,
      },
    );
  }

  // getcategories
  getcategories(
    categoryType: string,
  ): Observable<IdentityVaultCategoryResponse> {
    const params = new HttpParams().set('categoryType', categoryType || '');

    return this.http.get<IdentityVaultCategoryResponse>(
      `${environment.fasmUrl}/getcategories`,
      {
        params,
      },
    );
  }

  // Get All Folders
  getAllFolders(page: number, size: number): Observable<GetAllFoldersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<GetAllFoldersResponse>(
      `${environment.fasmUrl}/getallfolders`,
      {
        params,
      },
    );
  }

  // Add User(s) to Group
  addUserToGroup(payload: any[]): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${environment.fasmUrl}/addusertothegroup`, payload, {
      headers: headers,
      responseType: 'text', // ✅ ADD THIS LINE: Tells Angular not to parse the response as JSON
    });
  }

  // Add Folder(s) to Group
  addFolderToGroup(data: any): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('🚀 FINAL PAYLOAD:', data);

    return this.http.post(`${environment.fasmUrl}/addfoldertothegroup`, data, {
      headers: headers,
      responseType: 'text', // ✅ ADD THIS: Tells Angular not to parse the successful response as JSON
    });
  }

  // Add Folder(s) to Group
  addfolderorfiletothegrouporuser(data: any): Observable<any> {
    const token = this.authService.getToken();

    // 🛑 TEMPORARY DEBUG LOG
    console.log('DEBUG TOKEN:', token);

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${environment.fasmUrl}/addfolderorfiletothegrouporuser`,
      data,
      {
        headers: headers,
        responseType: 'text',
      },
    );
  }

  updatefolderorfiletothegrouporuser(data: any[]): Observable<any> {
    const token = this.authService.getToken();

    // 🛑 TEMPORARY DEBUG LOG
    console.log('DEBUG TOKEN:', token);

    if (!token) {
      console.error('❌ No token found');
      throw new Error('User not authenticated');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${environment.fasmUrl}/updatefolderorfiletothegrouporuser`,
      data,
      {
        headers: headers,
        responseType: 'text',
      },
    );
  }
}
