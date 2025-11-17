export interface UserAddress {
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

export interface User {
  id: string;
  nomeUsuario: string;
  email: string;
  cpfUsuario: string;
  tipo: string;
  telefone?: string | null;
  endereco?: UserAddress | null;
  profileImageUri?: string | null;
}

export interface Course {
  id: number;
  nomeCurso: string;
  descricaoCurta: string;
  descricaoDetalhada?: string;
  professor: string;
  categoria: string;
  tempoCurso: number;
  avaliacao?: number;
  imagemCurso?: string | null;
  status?: string;
  modulos?: Module[];
  enrolled?: boolean;
}

export interface CourseDetails extends Course {
  descricaoDetalhada: string;
  modulos: Module[];
}

export interface EnrollmentProgress {
  id: number;
  aula: Lesson;
  concluida: boolean;
  dataConclusao?: string | null;
}

export interface Enrollment {
  id: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  dataInscricao: string;
  dataConclusao?: string | null;
  curso: Course;
  progressoAulas: EnrollmentProgress[];
}

export interface Module {
  id: number;
  nomeModulo: string;
  tempoModulo: number;
  aulas: Lesson[];
}

export interface Lesson {
  id: number;
  nomeAula: string;
  tempoAula: number;
  videoUrl?: string | null;
  materialApoio?: string[] | null;
  descricaoConteudo?: string;
  concluida?: boolean;
}

export interface Review {
  autor: string | null;
  nota: number;
  comentario: string;
}

export interface DashboardCourseProgress {
  cursoId: number;
  nomeCurso: string;
  percentualConcluido: number;
}

export interface DashboardStudyHistory {
  data: string;
  minutosEstudados: number;
}

export interface DashboardCoursesByCategory {
  categoria: string;
  total: number;
}

export interface DashboardNotableReview {
  cursoId: number;
  nomeCurso: string;
  avaliacaoFeita: boolean;
}

export interface DashboardData {
  totalCursosInscritos: number;
  totalCertificados: number;
  tempoTotalEstudoMinutos: number;
  diasAtivosEstudo: number;
  ultimoDiaAtividade: string | null;
  diasConsecutivosEstudo: number;
  sequenciaAtualDiasConsecutivos: number;
  progressoPorCurso: DashboardCourseProgress[];
  historicoEstudo: DashboardStudyHistory[];
  cursosPorCategoria: DashboardCoursesByCategory[];
  notasMediasPorCurso: {
    cursoId: number;
    nomeCurso: string;
    notaMedia: number;
  }[];
  avaliacoes: DashboardNotableReview[];
}

export interface Certificate {
  id: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  inscriptionId: number;
  status: string;
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
  AvaliacaoCurso: { courseId: string };
  Dashboard: undefined;
  Profile: { userId: string };
};
