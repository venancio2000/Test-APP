export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
}

export interface UsuarioModel {
  id?: number;
  nome: string;
  username: string;
  cpf: string;
  email: string;
  telefoneFixo?: string;
  telefoneCelular?: string;
  sexo: 'M' | 'F' | 'O';
  dataNascimento: string; // ISO string
  password: string;
  createdAt?: string;
  perfil: Perfil;
}
