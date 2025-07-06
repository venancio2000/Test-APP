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
import { UsuarioModel, Perfil, Departamento } from '../../models/usuario.model';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CpfValidator } from '../../validators/cpf-validator';
import { NgxMaskDirective } from 'ngx-mask';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    NgxMaskDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cadastrar-usuario.component.html',
  styleUrls: ['./cadastrar-usuario.component.css'],
})
export class CadastrarUsuarioComponent implements OnInit {
  form!: FormGroup;
  hidePassword = true;
  isLoading = false;

  perfis: Perfil[] = [];
  departamentos: Departamento[] = [];
  modoVisualizacao = false;

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
      cpf: ['', [Validators.required, CpfValidator.validar]],
      email: ['', [Validators.required, Validators.email]],
      idFuncional: [
        '',
        [
          Validators.required,
          Validators.maxLength(7),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      perfil: [null, Validators.required], // inicialização forçada (pode melhorar com tipagem mais segura)
      departamento: [null, Validators.required],
    });

    this.usuarioService.listarDepartamentos().subscribe((data) => {
      this.departamentos = data;
    });

    this.usuarioService.listarPerfis().subscribe((data) => {
      this.perfis = data;

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.carregarUsuario(Number(id));
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.modoVisualizacao = params['modo'] === 'visualizar';

      if (this.modoVisualizacao) {
        this.form.disable(); // Desabilita todos os campos do form
      }
    });
  }

  verificarCpf(): void {
    const cpf = this.form.get('cpf')?.value;

    if (!this.form.get('cpf')?.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.usuarioService.verificarExistenciaCpf(cpf).subscribe({
      next: (existe: boolean) => {
        if (existe) {
          this.form.get('cpf')?.setErrors({ cpfExistente: true });
          this.form.get('cpf')?.markAsTouched();
          this.bloquearCampos();
        } else {
          this.liberarCampos();
        }
      },
      error: () => {
        this.mostrarErro('Erro ao verificar CPF.');
        this.bloquearCampos();
      },
    });
  }

  verificarEmail(): void {
    const email = this.form.get('email')?.value;

    if (!this.form.get('email')?.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.usuarioService.verificarExistenciaEmail(email).subscribe({
      next: (existe: boolean) => {
        if (existe) {
          this.form.get('email')?.setErrors({ emailExistente: true });
          this.form.get('email')?.markAsTouched();
          this.bloquearCamposEmail();
        } else {
          this.liberarCamposEmail();
        }
      },
      error: () => {
        this.mostrarErro('Erro ao verificar EMAIL.');
        this.bloquearCampos();
      },
    });
  }

  bloquearCampos(): void {
    this.form.get('nome')?.disable();
    this.form.get('idFuncional')?.disable();
    this.form.get('email')?.disable();
    this.form.get('departamento')?.disable();
    this.form.get('perfil')?.disable();
  }

  liberarCampos(): void {
    this.form.get('nome')?.enable();
    this.form.get('idFuncional')?.enable();
    this.form.get('email')?.enable();
    this.form.get('departamento')?.enable();
    this.form.get('perfil')?.enable();
  }

  bloquearCamposEmail(): void {
    this.form.get('nome')?.disable();
    this.form.get('idFuncional')?.disable();
    this.form.get('cpf')?.disable();
    this.form.get('departamento')?.disable();
    this.form.get('perfil')?.disable();
  }

  liberarCamposEmail(): void {
    this.form.get('nome')?.enable();
    this.form.get('idFuncional')?.enable();
    this.form.get('cpf')?.enable();
    this.form.get('departamento')?.enable();
    this.form.get('perfil')?.enable();
  }

  somenteNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    // permite apenas números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  compararPerfil(p1: Perfil, p2: Perfil): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  compararDepartamento(d1: Departamento, d2: Departamento): boolean {
    return d1 && d2 ? d1.id === d2.id : d1 === d2;
  }

  salvar(): void {
    this.isLoading = true;
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
        this.isLoading = false;
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

  cancelar() {
    this.router.navigate(['../usuarios']);
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

}
