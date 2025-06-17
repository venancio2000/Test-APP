import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioModel, Perfil } from '../../models/usuario.model';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatNativeDateModule,
  ],
  templateUrl: './cadastrar-usuario.component.html',
  styleUrls: ['./cadastrar-usuario.component.css'],
})
export class CadastrarUsuarioComponent implements OnInit {
  form!: FormGroup;
  hidePassword = true;

  perfis: Perfil[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null], // útil para edição
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idFuncional: ['', Validators.required],
      perfil: [null, Validators.required], // inicialização forçada (pode melhorar com tipagem mais segura)
      departamento: [''],
    });

    this.usuarioService.listarPerfis().subscribe((data) => {
      this.perfis = data;

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.carregarUsuario(Number(id));
      }
    });
  }

  compararPerfil(p1: Perfil, p2: Perfil): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  salvar(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const usuario: any = {
        ...formValue,
        perfil: { id: formValue.perfil.id }, // pega só o ID
      };

      const request$ = usuario.id
        ? this.usuarioService.updateUsuario(usuario.id, usuario)
        : this.usuarioService.salvarUsuario(usuario);

      request$.subscribe(() => {
        const mensagem = usuario.id
          ? 'Usuário atualizado com sucesso!'
          : 'Usuário salvo com sucesso!';
        this.snackBar.open(mensagem, 'Fechar', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['../usuarios']);
      });
    }
  }

  carregarUsuario(id: number): void {
    this.usuarioService.getUsuarioById(id).subscribe({
      next: (usuario) => {
        console.log('Perfil recebido do back-end:', usuario.perfil);
        console.log('Perfis disponíveis:', this.perfis);
        if (usuario) {
          this.form.patchValue({
            id: usuario.id,
            nome: usuario.nome,
            idFuncional: usuario.idFuncional,
            cpf: usuario.cpf,
            email: usuario.email,
            perfil: usuario.perfil,
            departamento: usuario.departamento,
          });
        }
      },
      error: (error: Error) => {
        this.snackBar.open(error.message, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  voltar(): void {
    this.router.navigate(['../usuarios']);
  }

  getProfileIcon(profileName: string): string {
    switch (profileName.toLowerCase()) {
      case 'administrador':
        return 'admin_panel_settings';
      case 'universidade':
        return 'school';
      case 'estudante':
        return 'person';
      default:
        return 'person';
    }
  }
  cancelar(): void {
  this.router.navigate(['../usuarios']);
}

}
