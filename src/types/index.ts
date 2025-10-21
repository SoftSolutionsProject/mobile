export interface User {
  id: string;
  nomeUsuario: string;
  email: string;
  cpfUsuario: string;
  profileImageUri?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: any;
  instructor: string;
  instructorImage: any;
  duration: string;
  modules: number;
  level: string;
  rating?: number;
  enrolled?: boolean;
}

export interface CourseDetails extends Course {
  nomeCurso: string;
  descricaoDetalhada: string;
  tempoCurso: number;
  avaliacao: number;
  modulos: Module[];
}

export interface Module {
  nomeModulo: string;
  aulas: Lesson[];
}

export interface Lesson {
  nomeAula: string;
  duracao: string;
  concluida?: boolean;
}

export interface Review {
  autor: string;
  nota: number;
  comentario: string;
  data: string;
}

export interface DashboardData {
  totalCursosInscritos: number;
  totalCertificados: number;
  tempoTotalEstudoMinutos: number;
  diasAtivosEstudo: number;
  ultimoDiaAtividade: string;
  diasConsecutivosEstudo: number;
  sequenciaAtualDiasConsecutivos: number;
}

export interface Certificate {
  id: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  certificateUrl: string;
}

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Cadastro: undefined;
  RecuperarSenha: undefined;
  QuemSomos: undefined;
  Contato: undefined;
  Certificados: undefined;
  CursosLista: undefined;
  DetalhesCurso: { courseId: string };
  AulasCurso: { courseId: string };
  Dashboard: undefined;
  Profile: { userId: string };
};
