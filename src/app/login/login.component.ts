import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { EsqueciSenhaDialogComponent } from '../esqueci-senha-dialog/esqueci-senha-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskDirective,
    MatDialogModule,
    EsqueciSenhaDialogComponent // se for standalone
  ],
  providers: [provideNgxMask()]
})
export class LoginComponent {
  cpf: string = '';
  senha: string = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private config: ConfigService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  fazerLogin() {
    this.loading = true;
    const loginData = {
      cpf: this.cpf,
      password: this.senha,
    };

    this.http
      .post<any>(`${this.config.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (res) => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.snackBar.open('Bem vindo ao Professor do Amanhã!', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
            this.http
              .get<any>(`${this.config.apiUrl}/users/username/${this.cpf}`)
              .subscribe({
                next: (user) => {
                  localStorage.setItem('nomeUsuario', user.nome);
                  localStorage.setItem('nomePerfil', user.perfil.nome);
                  this.authService.setNomeUsuario(user.nome);
                },
                error: () => {
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

  abrirDialogEsqueciSenha() {
    this.dialog.open(EsqueciSenhaDialogComponent, {
      width: '500px',
    });
  }
}
