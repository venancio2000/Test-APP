import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { EsqueciSenhaDialogComponent } from '../esqueci-senha-dialog/esqueci-senha-dialog.component';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgxMaskDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  cpf: string = '';
  senha: string = '';
  loading = false;
  showPassword = false;
  cpfError: string = '';
  senhaError: string = '';

  // ✅ Controle do menu mobile
  mobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private config: ConfigService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateCpf(): void {
    const cpf = this.cpf.replace(/\D/g, '');
    
    if (!this.cpf.trim()) {
      this.cpfError = 'CPF é obrigatório';
      return;
    }
    
    if (cpf.length !== 11) {
      this.cpfError = 'CPF deve ter 11 dígitos';
      return;
    }
    
    // Validação básica de CPF
    if (/^(\d)\1+$/.test(cpf)) {
      this.cpfError = 'CPF inválido';
      return;
    }
    
    this.cpfError = '';
  }

  validateSenha(): void {
    if (!this.senha.trim()) {
      this.senhaError = 'Senha é obrigatória';
      return;
    }
    
    if (this.senha.length < 6) {
      this.senhaError = 'Senha deve ter pelo menos 6 caracteres';
      return;
    }
    
    this.senhaError = '';
  }

  clearCpfError(): void {
    this.cpfError = '';
  }

  clearSenhaError(): void {
    this.senhaError = '';
  }

  isFormValid(): boolean {
    return this.cpf.trim() !== '' && 
           this.senha.trim() !== '' && 
           !this.cpfError && 
           !this.senhaError;
  }

  fazerLogin() {
    // Validate form before submission
    this.validateCpf();
    this.validateSenha();
    
    if (!this.isFormValid()) {
      return;
    }

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
