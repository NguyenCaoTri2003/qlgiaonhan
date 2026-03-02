import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'QL' | 'NVADMIN' | 'NVGN' | 'IT';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  password?: string; // Simple mock password handling
}

const INITIAL_USERS: User[] = [
  { email: 'Qlgiaonhan@nhigia.vn', name: 'Quản Lý Điều Phối', role: 'QL', avatar: 'https://ui-avatars.com/api/?name=QL&background=0D8ABC&color=fff', password: 'Nhigia@2016' },
  { email: 'nvadmin@nhigia.vn', name: 'Nhân Viên Admin', role: 'NVADMIN', avatar: 'https://ui-avatars.com/api/?name=AD&background=ef4444&color=fff', password: 'Nhigia@2016' },
  { email: 'nvgiaonhan1@nhigia.vn', name: 'Văn Giàu (Shipper)', role: 'NVGN', avatar: 'https://ui-avatars.com/api/?name=VG&background=10b981&color=fff', password: 'Nhigia@2016' },
  { email: 'it@nhigia.vn', name: 'IT Administrator', role: 'IT', avatar: 'https://ui-avatars.com/api/?name=IT&background=111827&color=fff', password: 'Nhigia@2016' }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Reactive User Database
  private _users = signal<User[]>(INITIAL_USERS);
  
  // Session State
  private _currentUser = signal<User | null>(null);
  
  currentUser = this._currentUser.asReadonly();
  users = this._users.asReadonly();
  
  isLoggedIn = computed(() => !!this._currentUser());
  userRole = computed(() => this._currentUser()?.role);

  login(email: string, pass: string): boolean {
    const foundUser = this._users().find(u => u.email === email && u.password === pass);
    
    if (foundUser) {
      this._currentUser.set(foundUser);
      return true;
    }
    return false;
  }

  logout() {
    this._currentUser.set(null);
  }

  // --- User Management (IT Only) ---

  addUser(user: User) {
    // Default password for new users if not specified
    if (!user.password) user.password = '123456'; 
    if (!user.avatar) user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
    
    this._users.update(current => [...current, user]);
  }

  deleteUser(email: string) {
    this._users.update(current => current.filter(u => u.email !== email));
  }

  // Helper to check if email exists
  userExists(email: string): boolean {
    return this._users().some(u => u.email === email);
  }
}