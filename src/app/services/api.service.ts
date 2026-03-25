import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApplicationResponseInterface,
  FileSystemAccessSummaryInterface,
  FileSystemResponseInterface,
  IdentityVaultDetailResponseInterface,
  IdentityVaultResponseInterface,
} from '../models/type';

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

  // ✅ Details API (with params)
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

  // ✅ Applications API (FIXED)

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

  // ✅ Applications Detail (OnClick)

  getapplicationdetails(
    appId: number = 0,
  ): Observable<ApplicationResponseInterface> {
    const params = new HttpParams().set('appId', appId);

    return this.http.get<ApplicationResponseInterface>(
      `${environment.apiUrl}/getapplicationdetails`,
      { params },
    );
  }

  // ✅ Identity Vault API (FIXED)

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

  // ✅ Identity Vault Detail (OnClick)

  getidentityvaultdetails(
    appId: number = 0,
  ): Observable<IdentityVaultDetailResponseInterface> {
    const params = new HttpParams().set('id', appId);

    return this.http.get<IdentityVaultDetailResponseInterface>(
      `${environment.apiUrl}/getidentityvaultdetails`,
      { params },
    );
  }
}
