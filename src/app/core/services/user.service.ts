import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPagedResponse, IPagedRequest } from '../models/common.model';
import { User, UpdateUserRequest, UserFilter } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`);
  }

  getUsers(opt: IPagedRequest<UserFilter>): Observable<IPagedResponse<User>> {
    let params = new HttpParams()
      .set('page', opt.page.toString())
      .set('pageSize', opt.pageSize.toString());

    if (opt.sortModel?.field) {
      params = params
        .set('sortField', opt.sortModel.field)
        .set('sortDirection', opt.sortModel.sort);
    }

    if (opt.filter) {
      for (const [key, value] of Object.entries(opt.filter)) {
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      }
    }

    return this.http.get<IPagedResponse<User>>(`${this.baseUrl}/query`, { params });
  }

  addUser(req: UpdateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, req);
  }

  patchUser(userId: number, req: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}`, req);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
