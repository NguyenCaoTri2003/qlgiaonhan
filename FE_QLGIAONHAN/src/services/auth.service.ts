import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User, UserRole } from "../type/models";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private API = environment.API_URL;

  private _currentUser = signal<User | null>(null);

  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  userRole = computed(() => this._currentUser()?.role);

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem("nhigia_user");
    const token = localStorage.getItem("nhigia_token");

    if (savedUser && token) {
      this._currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.API}/auth/login`, {
      email,
      password,
    });
  }

  setUser(user: User, token: string) {
    this._currentUser.set(user);

    localStorage.setItem("nhigia_user", JSON.stringify(user));
    localStorage.setItem("nhigia_token", token);
  }

  logout() {
    this._currentUser.set(null);

    localStorage.removeItem("nhigia_user");
    localStorage.removeItem("nhigia_token");
    
  }

  private _users = signal<User[]>([]);
  users = this._users.asReadonly();

  getUsers(role?: UserRole) {
    const url = role ? `${this.API}/users?role=${role}` : `${this.API}/users`;

    this.http.get<User[]>(url).subscribe({
      next: (data) => this._users.set(data),
      error: (err) => console.error("Load users error:", err),
    });
  }

  addUser(user: User) {
    this.http.post<User>(`${this.API}/users`, user).subscribe({
      next: (newUser) => {
        this._users.update((list) => [...list, newUser]);
      },
    });
  }

  deleteUser(email: string) {
    this.http.delete(`${this.API}/users/${email}`).subscribe({
      next: () => {
        this._users.update((list) => list.filter((u) => u.email !== email));
      },
    });
  }

  userExists(email: string): boolean {
    return this._users().some((u) => u.email === email);
  }
}
