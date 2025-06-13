import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { UsuarioModel } from '../models/usuario.model';

interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  perfil: string;
  nomePerfil: string;
  createdAt: string;
  telefoneFixo?: string;
  telefoneCelular?: string;
  cpf: string;
  sexo: string;
  departamento?: string;
  dataNascimento: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly endpoint = 'users';

  constructor(private http: HttpClient, private config: ConfigService) {}

  /**
   * Obtém a lista de usuários
   * @param params Parâmetros de filtro (opcional)
   * @returns Observable com array de usuários
   */
  getUsuarios(params?: {
    [key: string]: string | number;
  }): Observable<Usuario[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }

    return this.http
      .get<Usuario[]>(`${this.config.apiUrl}/${this.endpoint}`, {
        params: httpParams,
      })
      .pipe(catchError(this.handleError<Usuario[]>('getUsuarios', [])));
  }

  /**
   * Obtém um usuário específico por ID
   * @param id ID do usuário
   * @returns Observable com o usuário
   */
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${this.config.apiUrl}/${this.endpoint}/id/${id}`)
      .pipe(
        catchError((error: any) => {
          const errorMsg = error?.error?.message || 'Erro ao buscar usuário.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  /**
   * Cria um novo usuário
   * @param usuario Dados do usuário
   * @returns Observable com o usuário criado
   */
  salvarUsuario(usuario: Omit<UsuarioModel, 'id'>): Observable<UsuarioModel> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .post<UsuarioModel>(`${this.config.apiUrl}/${this.endpoint}`, usuario, {
        headers,
      })
      .pipe(catchError(this.handleError<UsuarioModel>('criarUsuario')));
  }

  /**
   * Atualiza um usuário existente
   * @param id ID do usuário
   * @param usuario Dados atualizados
   * @returns Observable com o usuário atualizado
   */
  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http
      .put<Usuario>(`${this.config.apiUrl}/${this.endpoint}/${id}`, usuario)
      .pipe(catchError(this.handleError<Usuario>('updateUsuario')));
  }

  /**
   * Remove um usuário
   * @param id ID do usuário
   * @returns Observable vazio
   */
  deleteUsuario(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.config.apiUrl}/${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError<void>('deletarUsuario')));
  }

  /**
   * Manipulador genérico de erros
   * @param operation Nome da operação que falhou
   * @param result Valor alternativo a ser retornado (opcional)
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      // Pode enviar o erro para um serviço de logging
      // this.logService.error(`${operation} failed: ${error.message}`);

      // Mantém a aplicação rodando retornando um resultado vazio
      return of(result as T);
    };
  }

  listarPerfis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.config.apiUrl}/perfis`);
  }
}
