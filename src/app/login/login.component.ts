import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  usuario: string = '';
  senha: string = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private config: ConfigService,
    private authService: AuthService
  ) {}

  fazerLogin() {
    this.loading = true;
    const loginData = {
      username: this.usuario,
      password: this.senha,
    };

    this.http
      .post<any>(`${this.config.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (res) => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.snackBar.open('Bem vindo ao Professor do Amanhã!', 'Fechar', {
              duration: 2000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
            this.http
              .get<any>(`${this.config.apiUrl}/users/${this.usuario}`)
              .subscribe({
                next: (user) => {
                  localStorage.setItem('nomeUsuario', user.nome);
                  this.authService.setNomeUsuario(user.nome);
                },
                error: (err) => {
                  this.snackBar.open('Erro ao buscar usuário', 'Fechar', {
                    duration: 3000,
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar'],
                  });
                },
              });
            this.loading = false;
            this.router.navigate(['/dashboard']);
          } else {
            this.loading = false;
            this.snackBar.open('Usuário ou senha inválidos', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Erro ao acessar o sistema', 'Fechar', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(err);
        },
      });
  }
}
