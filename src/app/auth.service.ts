import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
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

  private nomeUsuarioSubject = new BehaviorSubject<string>(
    localStorage.getItem('nomeUsuario') || 'Usuário'
  );
  nomeUsuario$ = this.nomeUsuarioSubject.asObservable();

  setNomeUsuario(nome: string) {
    localStorage.setItem('nomeUsuario', nome);
    this.nomeUsuarioSubject.next(nome);
  }

  getNomeUsuario() {
    return localStorage.getItem('nomeUsuario') || 'Usuário';
  }
}
