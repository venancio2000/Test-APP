import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';

interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  perfil: string;
  nomePerfil: string;
  createdAt: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  colunas: string[] = ['id', 'name', 'email', 'nomePerfil', 'acoes'];
  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {
    console.log('Serviço injetado:', this.usuarioService);
  }

  ngOnInit(): void {
    console.log('Componente inicializado');
    this.carregarListaUsuarios();
  }

  carregarListaUsuarios(): void {
    console.log('Método carregarListaUsuarios chamado');
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        console.log('Dados recebidos:', data);
        this.usuarios = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar usuários';
        this.loading = false;
        this.mostrarErro('Erro ao carregar usuários');
        console.error(err);
      },
    });
  }

  abrirCadastro(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  editarUsuario(id: number): void {
    this.router.navigate([`/usuarios/editar/${id}`]);
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
