import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ApiClient} from "../../../core/http/api-client";

export interface UserDto {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

export interface UserListResponse {
  items: UserDto[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiClient) {}

  /**
   * ✅ Danh sách user
   * GET users/list?page=&size=&q=
   */
  list(params: { page: number; size: number; q?: string }): Observable<UserListResponse> {
    return this.api.getData<UserListResponse>('users/list', params);
  }

  /**
   * ✅ Create user (multipart)
   * POST users/create
   */
  createMultipart(fd: FormData): Observable<any> {
    return this.api.postMultipart('users/create', fd);
  }

  /**
   * ✅ Update user (json)
   * PUT users/update/:id
   */
  update(id: number, body: any): Observable<any> {
    return this.api.putData(`users/update/${id}`, body);
  }

  /**
   * ✅ Delete user
   * DELETE users/delete/:id
   */
  delete(id: number): Observable<any> {
    return this.api.deleteData(`users/delete/${id}`);
  }
}
