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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  colunas: string[] = [
    'id',
    'name',
    'email',
    'dataNascimento',
    'sexo',
    'nomePerfil',
    'situacao',
    'acoes',
  ];
  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarListaUsuarios();
  }

  carregarListaUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar usuários';
        this.loading = false;
        this.mostrarErro('Erro ao carregar usuários');
      },
    });
  }

  abrirCadastro(): void {
    this.router.navigate(['/usuarios/cadastrar-usuario']);
  }

  editarUsuario(id: number): void {
    this.router.navigate([`/usuarios/editar/${id}`]);
  }

  deleteUsuario(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensagem: 'Tem certeza que deseja excluir este usuário?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioService.deleteUsuario(id).subscribe(() => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.carregarListaUsuarios();
        });
      }
    });
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
