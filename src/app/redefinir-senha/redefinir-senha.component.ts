import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfigService } from '../../config/config.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-redefinir-senha',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.css'],
})
export class RedefinirSenhaComponent implements OnInit {
  form!: FormGroup;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private config: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
    this.form = this.fb.group({
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required],
    });
  }

  senhasDiferentes(): boolean {
    const senha = this.form.get('senha')?.value;
    const confirmar = this.form.get('confirmarSenha')?.value;

    // Se algum campo estiver vazio, já considera inválido
    if (!senha || !confirmar) {
      return false;
    }
    return senha !== confirmar;
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  redefinirSenha() {
    if (this.form.valid && !this.senhasDiferentes()) {
      this.http
        .post(`${this.config.apiUrl}/auth/redefinir-senha`, {
          token: this.token,
          novaSenha: this.form.get('senha')?.value,
        })
        .subscribe(
          (res: any) => {
            console.log(res?.mensagem); // agora existe mensagem
            this.snackBar.open('Senha redefinida com sucesso!', 'Fechar', {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar'],
            });
            this.router.navigate(['/login']);
          },
          () => {
            this.snackBar.open(
              'Erro ao redefinir senha. Tente novamente.',
              'Fechar',
              {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['error-snackbar'],
              }
            );
          }
        );
    }
  }
}
