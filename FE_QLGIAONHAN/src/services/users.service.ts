import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class UsersService {
  private API = "http://localhost:5000/api";
  constructor(private http: HttpClient) {}

  getSenders() {
    return this.http.get<any[]>(`${this.API}/users/senders`);
  }
}