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
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

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
  ],
  templateUrl: './cadastrar-usuario.component.html',
  styleUrls: ['./cadastrar-usuario.component.css'],
})
export class CadastrarUsuarioComponent implements OnInit {
  form!: FormGroup;

  perfis: Perfil[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuarioService.listarPerfis().subscribe((data) => {
      this.perfis = data;
    });
    this.form = this.fb.group({
      nome: ['', Validators.required],
      username: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefoneFixo: [''],
      telefoneCelular: [''],
      sexo: ['M', Validators.required],
      dataNascimento: [''],
      password: ['', Validators.required],
      perfil: {} as Perfil, // inicialização forçada (pode melhorar com tipagem mais segura)
    });
  }

  salvar(): void {
    if (this.form.valid) {
      const usuario: UsuarioModel = this.form.value as UsuarioModel;
      this.usuarioService.salvarUsuario(usuario).subscribe(() => {
        alert('Usuário salvo com sucesso!');
        this.form.reset();
      });
    }
  }

  voltar(): void {
    this.router.navigate(['../usuarios']);
  }
}
