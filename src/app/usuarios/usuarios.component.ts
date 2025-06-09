import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
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
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  colunas: string[] = ['id', 'name', 'email', 'role'];
  usuarios: Usuario[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulação de dados
    this.usuarios = [
      { id: 1, name: 'Alexandre', email: 'alexandre@spezi.com', role: 'ADMIN' },
      { id: 2, name: 'João', email: 'joao@spezi.com', role: 'ADMIN' },
      { id: 3, name: 'Rodrigo', email: 'rodrigo@spezi.com', role: 'ADMIN' },
    ];
  }

  abrirCadastro(): void {
    this.router.navigate(['/usuarios/novo']);
  }

}
