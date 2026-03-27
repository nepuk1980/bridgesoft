import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApplicationAccountsResponseInterface,
  ApplicationResponseInterface,
  FileSystemAccessSummaryInterface,
  FileSystemResponseInterface,
  IdentityVaultDetailResponseInterface,
  IdentityVaultResponseInterface,
} from '../models/type';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // ✅ Summary API
  getfilesystemaccesspermissionsummary(): Observable<FileSystemAccessSummaryInterface> {
    return this.http.get<FileSystemAccessSummaryInterface>(
      `${environment.apiUrl}/getfilesystemaccesspermissionsummary`,
    );
  }

  // ✅ Details API
  getFilesystemAccessPermissionDetails(
    ruleCategory: string,
    page: number = 0,
    size: number = 10,
  ): Observable<FileSystemResponseInterface> {
    const params = new HttpParams()
      .set('ruleCategory', ruleCategory)
      .set('page', page)
      .set('size', size);

    return this.http.get<FileSystemResponseInterface>(
      `${environment.apiUrl}/getfilesystemaccesspermissiondetails`,
      { params },
    );
  }

  // ✅ Applications List
  getlistofapplications(
    page: number = 0,
    size: number = 10,
  ): Observable<ApplicationResponseInterface> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<ApplicationResponseInterface>(
      `${environment.apiUrl}/getlistofapplications`,
      { params },
    );
  }

  // ✅ Application Details
  getapplicationdetails(appId: number): Observable<any> {
    const params = new HttpParams().set('appId', appId);

    return this.http.get<any>(`${environment.apiUrl}/getapplicationdetails`, {
      params,
    });
  }

  // ✅ Identity Vault List
  getlistofidentityvaults(
    page: number = 0,
    size: number = 10,
  ): Observable<IdentityVaultResponseInterface> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<IdentityVaultResponseInterface>(
      `${environment.apiUrl}/getlistofidentityvaults`,
      { params },
    );
  }

  // ✅ Identity Vault Details
  getidentityvaultdetails(
    id: number,
  ): Observable<IdentityVaultDetailResponseInterface> {
    const params = new HttpParams().set('id', id);

    return this.http.get<IdentityVaultDetailResponseInterface>(
      `${environment.apiUrl}/getidentityvaultdetails`,
      { params },
    );
  }
  // ✅ Identity Vault Application Details
  getapplicationaccount(
    appId: number,
  ): Observable<ApplicationAccountsResponseInterface> {
    const params = new HttpParams().set('appId', appId);

    return this.http.get<ApplicationAccountsResponseInterface>(
      `${environment.apiUrl}/getapplicationaccount`,
      { params },
    );
  }

  private authService = inject(AuthService);

  updateApplicationDetails(id: number, data: any): Observable<any> {
    const token = this.authService.getToken();

    console.log('🆔 ID:', id);
    console.log('📦 DATA:', data);
    console.log('🔑 TOKEN:', token);

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
      `${environment.apiUrl}/updateapplicationdetails`,
      payload,
      { headers },
    );
  }
}
