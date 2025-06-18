import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';
import { EsqueciSenhaDialogComponent } from '../esqueci-senha-dialog/esqueci-senha-dialog.component';

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    nome: string;
    email: string;
    perfil: {
      id: number;
      nome: string;
    };
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private dialog: MatDialog,
    private config: ConfigService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadRememberedCredentials();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private loadRememberedCredentials(): void {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberedUsername && rememberMe) {
      this.loginForm.patchValue({
        username: rememberedUsername,
        rememberMe: true
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performLogin(): void {
    this.isLoading = true;
    const { username, password, rememberMe } = this.loginForm.value;

    const loginData = {
      cpf: username.replace(/\D/g, ''), // Remove formatação se houver
      password: password
    };

    this.http.post<LoginResponse>(`${this.config.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (response) => this.handleLoginSuccess(response, username, rememberMe),
        error: (error) => this.handleLoginError(error)
      });
  }

  private handleLoginSuccess(response: LoginResponse, username: string, rememberMe: boolean): void {
    if (response.token) {
      // Salvar token
      localStorage.setItem('token', response.token);
      
      // Gerenciar "lembrar-me"
      this.handleRememberMe(username, rememberMe);
      
      // Buscar dados do usuário
      this.fetchUserData(username);
      
      // Mostrar mensagem de sucesso
      this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      // Navegar para dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.handleLoginError({ message: 'Token não recebido' });
    }
    
    this.isLoading = false;
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    
    let errorMessage = 'Erro ao realizar login';
    
    if (error.status === 401) {
      errorMessage = 'Usuário ou senha inválidos';
    } else if (error.status === 404) {
      errorMessage = 'Usuário não encontrado';
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão. Verifique sua internet';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private handleRememberMe(username: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberMe');
    }
  }

  private fetchUserData(username: string): void {
    this.http.get<any>(`${this.config.apiUrl}/users/username/${username}`)
      .subscribe({
        next: (user) => {
          localStorage.setItem('nomeUsuario', user.nome);
          localStorage.setItem('nomePerfil', user.perfil.nome);
          this.authService.setNomeUsuario(user.nome);
        },
        error: (error) => {
          console.error('Erro ao buscar dados do usuário:', error);
          this.snackBar.open('Aviso: Não foi possível carregar dados do usuário', 'Fechar', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['warning-snackbar']
          });
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    
    const dialogRef = this.dialog.open(EsqueciSenhaDialogComponent, {
      width: '500px',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Processo de recuperação de senha iniciado');
      }
    });
  }

  // Método para login com gov.br (placeholder)
  onGovBrLogin(): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  // Getters para facilitar acesso aos controles do formulário
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  // Método para validação customizada
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  // Método para obter mensagem de erro
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName === 'username' ? 'Usuário' : 'Senha'} é obrigatório`;
    }
    
    if (control?.hasError('email')) {
      return 'Digite um email válido';
    }
    
    if (control?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    
    return '';
  }
}