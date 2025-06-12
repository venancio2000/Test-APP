import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  dataNascimento?: string;
  sexo?: string;
  nomePerfil: string;
  departamento?: string;
  situacao?: string;
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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  colunas: string[] = [
    'id',
    'name',
    'email',
    'dataNascimento',
    'sexo',
    'nomePerfil',
    'departamento',
    'situacao',
    'acoes',
  ];
  dataSource = new MatTableDataSource<Usuario>([]);
  usuarios: Usuario[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarListaUsuarios();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  carregarListaUsuarios(): void {
    this.loading = true;
    this.error = '';

    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erro ao carregar usuários.';
        this.loading = false;
        this.mostrarErro(this.error);
      },
    });
  }

  aplicarFiltro(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
        this.loading = true;
        this.usuarioService.deleteUsuario(id).subscribe({
          next: () => {
            this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
            this.carregarListaUsuarios();
          },
          error: (error) => {
            this.loading = false;
            this.mostrarErro(error.message || 'Erro ao excluir usuário');
          },
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
