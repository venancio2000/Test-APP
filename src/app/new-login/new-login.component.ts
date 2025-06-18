import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-login.component.html',
  styleUrls: ['./new-login.component.css']
})
export class NewLoginComponent {
  usuario: string = '';
  senha: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    // Lógica de login aqui
    console.log('Login attempt:', { usuario: this.usuario, senha: this.senha });
  }

  onGovBrLogin() {
    // Lógica para login com gov.br
    console.log('Gov.br login attempt');
  }

  onForgotPassword() {
    // Lógica para esqueci minha senha
    console.log('Forgot password clicked');
  }
}