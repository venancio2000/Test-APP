import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  colunas: string[] = ['id', 'name', 'email', 'role'];
  usuarios: Usuario[] = [];

  ngOnInit(): void {
    // Simulação de dados
    this.usuarios = [
      { id: 1, name: 'Alice', email: 'alice@email.com', role: 'ADMIN' },
      { id: 2, name: 'Bruno', email: 'bruno@email.com', role: 'ADMIN' },
      { id: 3, name: 'Carla', email: 'carla@email.com', role: 'ADMIN' }
    ];
  }
}
