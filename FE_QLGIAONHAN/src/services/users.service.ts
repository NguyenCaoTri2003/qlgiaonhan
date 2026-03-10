import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class UsersService {
  private API = environment.API_URL;
  constructor(private http: HttpClient) {}

  getSenders() {
    return this.http.get<any[]>(`${this.API}/users/senders`);
  }

  getAdmins() {
    return this.http.get<any[]>(`${this.API}/users/admins`);
  }

  getShippers() {
     return this.http.get<any[]>(`${this.API}/users/shippers`);
  }
}
