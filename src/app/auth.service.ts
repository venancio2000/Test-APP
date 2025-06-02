import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'token';

  constructor() {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('nomeUsuario'); // se quiser limpar o nome também
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
