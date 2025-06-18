import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let configService: jasmine.SpyObj<ConfigService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['setNomeUsuario']);
    const configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      apiUrl: 'http://localhost:8081/basic-api/v1'
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    httpMock = TestBed.inject(HttpTestingController);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    expect(usernameControl?.valid).toBeFalsy();
    expect(passwordControl?.valid).toBeFalsy();

    usernameControl?.setValue('test@example.com');
    passwordControl?.setValue('123456');

    expect(usernameControl?.valid).toBeTruthy();
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const usernameControl = component.loginForm.get('username');
    
    usernameControl?.setValue('invalid-email');
    expect(usernameControl?.hasError('email')).toBeTruthy();
    
    usernameControl?.setValue('valid@email.com');
    expect(usernameControl?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should handle successful login', () => {
    const mockResponse = {
      token: 'mock-token',
      user: {
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        perfil: { id: 1, nome: 'Admin' }
      }
    };

    component.loginForm.patchValue({
      username: 'test@example.com',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();

    const loginReq = httpMock.expectOne(`${configService.apiUrl}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({
      cpf: 'test@example.com',
      password: '123456'
    });
    
    loginReq.flush(mockResponse);

    const userReq = httpMock.expectOne(`${configService.apiUrl}/users/username/test@example.com`);
    userReq.flush({
      nome: 'Test User',
      perfil: { nome: 'Admin' }
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error', () => {
    component.loginForm.patchValue({
      username: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${configService.apiUrl}/auth/login`);
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.isLoading).toBeFalsy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle remember me functionality', () => {
    const username = 'test@example.com';
    
    component.loginForm.patchValue({
      username: username,
      password: '123456',
      rememberMe: true
    });

    component.onSubmit();

    const loginReq = httpMock.expectOne(`${configService.apiUrl}/auth/login`);
    loginReq.flush({ token: 'mock-token' });

    const userReq = httpMock.expectOne(`${configService.apiUrl}/users/username/${username}`);
    userReq.flush({ nome: 'Test User', perfil: { nome: 'Admin' } });

    expect(localStorage.getItem('rememberedUsername')).toBe(username);
    expect(localStorage.getItem('rememberMe')).toBe('true');
  });

  it('should load remembered credentials on init', () => {
    const rememberedUsername = 'remembered@example.com';
    localStorage.setItem('rememberedUsername', rememberedUsername);
    localStorage.setItem('rememberMe', 'true');

    component.ngOnInit();

    expect(component.loginForm.get('username')?.value).toBe(rememberedUsername);
    expect(component.loginForm.get('rememberMe')?.value).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    
    component.hidePassword = !component.hidePassword;
    
    expect(component.hidePassword).toBeFalsy();
  });

  it('should prevent form submission when invalid', () => {
    component.loginForm.patchValue({
      username: '',
      password: ''
    });

    component.onSubmit();

    httpMock.expectNone(`${configService.apiUrl}/auth/login`);
    expect(component.isLoading).toBeFalsy();
  });

  it('should mark form as touched when invalid submission attempted', () => {
    component.loginForm.patchValue({
      username: '',
      password: ''
    });

    component.onSubmit();

    expect(component.loginForm.get('username')?.touched).toBeTruthy();
    expect(component.loginForm.get('password')?.touched).toBeTruthy();
  });

  it('should open forgot password dialog', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true)
    } as any);

    component.onForgotPassword(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component['dialog'].open).toHaveBeenCalled();
  });

  it('should handle gov.br login placeholder', () => {
    spyOn(component['snackBar'], 'open');
    
    component.onGovBrLogin();
    
    expect(component['snackBar'].open).toHaveBeenCalledWith(
      'Funcionalidade em desenvolvimento',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should return correct error messages', () => {
    component.loginForm.get('username')?.setErrors({ required: true });
    component.loginForm.get('username')?.markAsTouched();
    
    expect(component.getErrorMessage('username')).toBe('Usuário é obrigatório');
    
    component.loginForm.get('username')?.setErrors({ email: true });
    expect(component.getErrorMessage('username')).toBe('Digite um email válido');
    
    component.loginForm.get('password')?.setErrors({ minlength: true });
    component.loginForm.get('password')?.markAsTouched();
    expect(component.getErrorMessage('password')).toBe('Senha deve ter pelo menos 6 caracteres');
  });

  it('should check if control has specific error', () => {
    component.loginForm.get('username')?.setErrors({ required: true });
    component.loginForm.get('username')?.markAsTouched();
    
    expect(component.hasError('username', 'required')).toBeTruthy();
    expect(component.hasError('username', 'email')).toBeFalsy();
  });

  it('should handle network error', () => {
    component.loginForm.patchValue({
      username: 'test@example.com',
      password: '123456'
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${configService.apiUrl}/auth/login`);
    req.error(new ErrorEvent('Network error'), { status: 0 });

    expect(component.isLoading).toBeFalsy();
  });

  it('should clean up remember me when unchecked', () => {
    localStorage.setItem('rememberedUsername', 'test@example.com');
    localStorage.setItem('rememberMe', 'true');

    component.loginForm.patchValue({
      username: 'test@example.com',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();

    const loginReq = httpMock.expectOne(`${configService.apiUrl}/auth/login`);
    loginReq.flush({ token: 'mock-token' });

    const userReq = httpMock.expectOne(`${configService.apiUrl}/users/username/test@example.com`);
    userReq.flush({ nome: 'Test User', perfil: { nome: 'Admin' } });

    expect(localStorage.getItem('rememberedUsername')).toBeNull();
    expect(localStorage.getItem('rememberMe')).toBeNull();
  });
});