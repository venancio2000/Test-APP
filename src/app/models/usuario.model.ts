export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Departamento {
  id: number;
  nome: string;
  sigla?: string;
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
  dataNascimento: string;
  password: string;
  createdAt?: string;
  perfil: Perfil;
  departamento?: string;
  situacao: boolean;
}
