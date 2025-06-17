import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../config/config.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-esqueci-senha-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Redefinir Senha</h2>
    <mat-dialog-content>
      <p>
        Informe seu e-mail institucional para receber um link de redefinição.
      </p>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>E-mail</mat-label>
        <input matInput [(ngModel)]="email" type="email" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="fechar()">
        Cancelar
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="enviar()"
        [disabled]="!email"
      >
        Enviar
      </button>
    </mat-dialog-actions>
  `,
})
export class EsqueciSenhaDialogComponent {
  email: string = '';

  constructor(
    private dialogRef: MatDialogRef<EsqueciSenhaDialogComponent>,
    private http: HttpClient,
    private config: ConfigService,
    private snackBar: MatSnackBar
  ) {}

  fechar() {
    this.dialogRef.close();
  }

  enviar() {
    this.http
      .post(`${this.config.apiUrl}/auth/esqueci-senha`, { email: this.email })
      .subscribe(
        (res: any) => {
          this.snackBar.open(
            'Link de redefinição de senha enviado com sucesso!',
            'Fechar',
            {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.fechar();
        },
        (error) => {
          const mensagem =
            error.status === 404
              ? 'E-mail não encontrado.'
              : 'Erro ao enviar e-mail. Tente novamente mais tarde.';
          this.snackBar.open(mensagem, 'Fechar', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        }
      );
  }
}
