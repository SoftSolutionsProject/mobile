import axios, { AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { environment } from '../config/environment';
import {
  Course,
  CourseDetails,
  DashboardData,
  Enrollment,
  EnrollmentProgress,
  Lesson,
  Module,
  Review,
  User,
} from '../types';

export interface LoginResponse {
  usuario: {
    id: number;
    nomeUsuario: string;
    email: string;
    cpfUsuario: string;
    tipo: string;
  };
  access_token: string;
}

type FileSystemWithFallback = typeof FileSystem & {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
  Paths?: {
    document?: { uri?: string | null };
    cache?: { uri?: string | null };
  };
};

class ApiService {
  private readonly API_URL = environment.apiUrl;

  constructor() {
    axios.defaults.timeout = 15000;
  }

  // ---------- Helpers ----------

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { headers };
  }

  private normaliseMessage(message: unknown): string | undefined {
    if (!message) {
      return undefined;
    }

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object') {
      return JSON.stringify(message);
    }

    return String(message);
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: unknown }>;
      const messageFromServer = this.normaliseMessage(
        axiosError.response?.data?.message,
      );

      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique sua internet ou se a API está disponível.',
        );
      }

      if (messageFromServer) {
        throw new Error(messageFromServer);
      }

      const status = axiosError.response?.status;

      if (status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (status === 403) {
        throw new Error('Você não tem permissão para executar esta ação.');
      }

      if (status === 404) {
        throw new Error('Registro não encontrado.');
      }

      throw new Error('Ocorreu um erro ao comunicar com o servidor.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro inesperado.');
  }

  private ensureNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private ensureString(value: unknown, fallback = ''): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return fallback;
  }

  private getDownloadDirectory(): string {
    const fs = FileSystem as FileSystemWithFallback;
    const directory =
      fs.documentDirectory ||
      fs.cacheDirectory ||
      fs.Paths?.document?.uri ||
      fs.Paths?.cache?.uri ||
      '';
    if (!directory) {
      throw new Error('Diretório temporário não encontrado para salvar certificados.');
    }
    return directory.endsWith('/') ? directory : `${directory}/`;
  }

  private async safeDeleteFile(uri: string) {
    if (!uri) {
      return;
    }
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (fileError) {
      console.warn('Não foi possível remover arquivo temporário:', fileError);
    }
  }

  private mapLesson(aula: any): Lesson {
    return {
      id: this.ensureNumber(aula?.id),
      nomeAula: this.ensureString(aula?.nomeAula, 'Aula'),
      tempoAula: this.ensureNumber(aula?.tempoAula),
      videoUrl: aula?.videoUrl ?? null,
      materialApoio: aula?.materialApoio ?? null,
      descricaoConteudo: aula?.descricaoConteudo,
      concluida: aula?.concluida ?? false,
    };
  }

  private mapModule(modulo: any): Module {
    const aulas = Array.isArray(modulo?.aulas) ? modulo.aulas.map((a: any) => this.mapLesson(a)) : [];

    return {
      id: this.ensureNumber(modulo?.id),
      nomeModulo: this.ensureString(modulo?.nomeModulo, 'Módulo'),
      tempoModulo: this.ensureNumber(modulo?.tempoModulo),
      aulas,
    };
  }

  private mapCourse(course: any): Course {
    return {
      id: this.ensureNumber(course?.id),
      nomeCurso: this.ensureString(course?.nomeCurso, 'Curso'),
      descricaoCurta: this.ensureString(course?.descricaoCurta, ''),
      descricaoDetalhada: course?.descricaoDetalhada ?? course?.descricaoCurta ?? '',
      professor: this.ensureString(course?.professor, 'Professor não informado'),
      categoria: this.ensureString(course?.categoria, 'Geral'),
      tempoCurso: this.ensureNumber(course?.tempoCurso),
      avaliacao: course?.avaliacao ?? null,
      imagemCurso: course?.imagemCurso ?? null,
      status: course?.status,
      modulos: Array.isArray(course?.modulos)
        ? course.modulos.map((m: any) => this.mapModule(m))
        : undefined,
      enrolled: course?.enrolled,
    };
  }

  private mapCourseDetails(course: any): CourseDetails {
    const base = this.mapCourse(course);

    return {
      ...base,
      descricaoDetalhada: this.ensureString(
        course?.descricaoDetalhada ?? base.descricaoDetalhada,
        base.descricaoCurta,
      ),
      modulos: Array.isArray(course?.modulos)
        ? course.modulos.map((m: any) => this.mapModule(m))
        : [],
    };
  }

  private mapEnrollmentProgress(progress: any): EnrollmentProgress {
    return {
      id: this.ensureNumber(progress?.id),
      aula: this.mapLesson(progress?.aula),
      concluida: Boolean(progress?.concluida),
      dataConclusao: progress?.dataConclusao ?? null,
    };
  }

  private mapEnrollment(enrollment: any): Enrollment {
    return {
      id: this.ensureNumber(enrollment?.id),
      status: this.ensureString(enrollment?.status, 'ativo') as Enrollment['status'],
      dataInscricao: this.ensureString(enrollment?.dataInscricao, new Date().toISOString()),
      dataConclusao: enrollment?.dataConclusao ?? null,
      curso: this.mapCourse(enrollment?.curso),
      progressoAulas: Array.isArray(enrollment?.progressoAulas)
        ? enrollment.progressoAulas.map((p: any) => this.mapEnrollmentProgress(p))
        : [],
    };
  }

  private mapAddress(data: any): User['endereco'] {
    if (!data) {
      return null;
    }
    const address = {
      rua: this.ensureString(data?.rua, ''),
      numero: this.ensureString(data?.numero, ''),
      bairro: this.ensureString(data?.bairro, ''),
      cidade: this.ensureString(data?.cidade, ''),
      estado: this.ensureString(data?.estado, ''),
      pais: this.ensureString(data?.pais, ''),
    };

    const hasAnyValue = Object.values(address).some(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );

    return hasAnyValue ? address : null;
  }

  private mapUser(data: any): User {
    return {
      id: this.ensureNumber(data?.id).toString(),
      nomeUsuario: this.ensureString(data?.nomeUsuario, ''),
      email: this.ensureString(data?.email, ''),
      cpfUsuario: this.ensureString(data?.cpfUsuario, ''),
      tipo: this.ensureString(data?.tipo, 'aluno'),
      telefone: (() => {
        const telefone = this.ensureString(data?.telefone, '');
        return telefone.length > 0 ? telefone : null;
      })(),
      endereco: this.mapAddress(data?.endereco),
      profileImageUri: null,
    };
  }

  private mapReview(review: any): Review {
    return {
      autor: review?.autor ?? null,
      nota: this.ensureNumber(review?.nota),
      comentario: this.ensureString(review?.comentario, 'Sem comentário.'),
    };
  }

  private mapDashboard(data: any): DashboardData {
    return {
      totalCursosInscritos: this.ensureNumber(data?.totalCursosInscritos),
      totalCertificados: this.ensureNumber(data?.totalCertificados),
      tempoTotalEstudoMinutos: this.ensureNumber(data?.tempoTotalEstudoMinutos),
      diasAtivosEstudo: this.ensureNumber(data?.diasAtivosEstudo),
      ultimoDiaAtividade: data?.ultimoDiaAtividade ?? null,
      diasConsecutivosEstudo: this.ensureNumber(data?.diasConsecutivosEstudo),
      sequenciaAtualDiasConsecutivos: this.ensureNumber(data?.sequenciaAtualDiasConsecutivos),
      progressoPorCurso: Array.isArray(data?.progressoPorCurso)
        ? data.progressoPorCurso.map((item: any) => ({
            cursoId: this.ensureNumber(item?.cursoId),
            nomeCurso: this.ensureString(item?.nomeCurso, 'Curso'),
            percentualConcluido: this.ensureNumber(item?.percentualConcluido),
          }))
        : [],
      historicoEstudo: Array.isArray(data?.historicoEstudo)
        ? data.historicoEstudo.map((item: any) => ({
            data: this.ensureString(item?.data, new Date().toISOString()),
            minutosEstudados: this.ensureNumber(item?.minutosEstudados),
          }))
        : [],
      cursosPorCategoria: Array.isArray(data?.cursosPorCategoria)
        ? data.cursosPorCategoria.map((item: any) => ({
            categoria: this.ensureString(item?.categoria, 'Categoria'),
            total: this.ensureNumber(item?.total),
          }))
        : [],
      notasMediasPorCurso: Array.isArray(data?.notasMediasPorCurso)
        ? data.notasMediasPorCurso.map((item: any) => ({
            cursoId: this.ensureNumber(item?.cursoId),
            nomeCurso: this.ensureString(item?.nomeCurso, 'Curso'),
            notaMedia: this.ensureNumber(item?.notaMedia),
          }))
        : [],
      avaliacoes: Array.isArray(data?.avaliacoes)
        ? data.avaliacoes.map((item: any) => ({
            cursoId: this.ensureNumber(item?.cursoId),
            nomeCurso: this.ensureString(item?.nomeCurso, 'Curso'),
            avaliacaoFeita: Boolean(item?.avaliacaoFeita),
          }))
        : [],
    };
  }

  // ---------- Autenticação ----------

  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.API_URL}/usuarios/login`,
        { email, senha },
      );

      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('_idUser', String(response.data.usuario.id));
      await AsyncStorage.setItem('tipoUser', response.data.usuario.tipo);

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async cadastrarUsuario(data: Record<string, unknown>): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/usuarios/cadastro`, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('_idUser');
    await AsyncStorage.removeItem('tipoUser');
  }

  // ---------- Perfil ----------

  async getProfile(userId: number): Promise<User> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/usuarios/${userId}`, headers);
      return this.mapUser(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${this.API_URL}/usuarios/${userId}`, userData, headers);
      return this.mapUser(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Cursos ----------

  async listarCursos(): Promise<Course[]> {
    try {
      const response = await axios.get(`${this.API_URL}/cursos`);
      return Array.isArray(response.data)
        ? response.data.map((course: any) => this.mapCourse(course))
        : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async obterCurso(id: number): Promise<CourseDetails> {
    try {
      const response = await axios.get(`${this.API_URL}/cursos/${id}`);
      return this.mapCourseDetails(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async listarModulosEAulasDoCurso(idCurso: number): Promise<Module[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/cursos/${idCurso}/aulas`, headers);
      return Array.isArray(response.data)
        ? response.data.map((modulo: any) => this.mapModule(modulo))
        : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async obterQuantidadeInscritos(
    idCurso: number,
  ): Promise<{ quantidadeInscritos: number }> {
    try {
      const response = await axios.get<{ quantidadeInscritos: number }>(
        `${this.API_URL}/cursos/${idCurso}/inscritos`,
      );
      return {
        quantidadeInscritos: this.ensureNumber(response.data?.quantidadeInscritos),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Inscrições ----------

  async listarInscricoesUsuario(): Promise<Enrollment[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/inscricoes/usuario`, headers);
      return Array.isArray(response.data)
        ? response.data.map((inscricao: any) => this.mapEnrollment(inscricao))
        : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async inscreverUsuario(idCurso: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(`${this.API_URL}/inscricoes/cursos/${idCurso}`, {}, headers);
    } catch (error: any) {
      // Se já está inscrito, tratamos como sucesso para evitar fluxo quebrado
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return;
      }
      this.handleError(error);
    }
  }

  async cancelarInscricao(idInscricao: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(`${this.API_URL}/inscricoes/${idInscricao}/cancelar`, headers);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Já não existe inscrição, consideramos sucesso idempotente
        return;
      }
      this.handleError(error);
    }
  }

  async concluirAula(idInscricao: number, idAula: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(
        `${this.API_URL}/inscricoes/${idInscricao}/concluir-aula/${idAula}`,
        {},
        headers,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async desmarcarAula(idInscricao: number, idAula: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(
        `${this.API_URL}/inscricoes/${idInscricao}/desmarcar-aula/${idAula}`,
        {},
        headers,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async obterProgresso(
    idInscricao: number,
  ): Promise<{ progresso: number; aulasConcluidas: number; totalAulas: number }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${this.API_URL}/inscricoes/${idInscricao}/progresso`,
        headers,
      );

      return {
        progresso: this.ensureNumber(response.data?.progresso),
        aulasConcluidas: this.ensureNumber(response.data?.aulasConcluidas),
        totalAulas: this.ensureNumber(response.data?.totalAulas),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Suporte / E-mail ----------

  async enviarEmailSuporte(dados: {
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.API_URL}/email/suporte`, dados);
    } catch (error) {
      this.handleError(error);
    }
  }

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    try {
      const payload = {
        nome: 'Usuário',
        email,
        assunto: 'Recuperação de Senha',
        mensagem: `Solicitação de recuperação de senha para o email: ${email}. Nossa equipe entrará em contato para auxiliá-lo.`,
      };

      await axios.post(`${this.API_URL}/email/suporte`, payload);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Certificados ----------

  async baixarCertificado(idInscricao: number, suggestedName?: string): Promise<string> {
    const sanitizedName = (suggestedName && suggestedName.trim().length > 0
      ? suggestedName.trim()
      : `certificado_${idInscricao}`
    ).replace(/[^a-zA-Z0-9-_]/g, '_');

    const fileName = `${sanitizedName}_${Date.now()}.pdf`;
    const directory = this.getDownloadDirectory();
    const fileUri = `${directory}${fileName}`;

    try {
      await this.safeDeleteFile(fileUri);
      const { headers } = await this.getAuthHeaders();
      const downloadOptions =
        headers.Authorization !== undefined
          ? { headers: { Authorization: headers.Authorization } }
          : undefined;

      const downloadResult = await FileSystem.downloadAsync(
        `${this.API_URL}/certificados/${idInscricao}`,
        fileUri,
        downloadOptions,
      );
      return downloadResult.uri;
    } catch (error) {
      await this.safeDeleteFile(fileUri);
      this.handleError(error);
    }
  }

  async verificarCertificado(idInscricao: number): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.get(`${this.API_URL}/certificados/${idInscricao}`, {
        ...headers,
        responseType: 'arraybuffer',
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      this.handleError(error);
    }
  }

  async consultarCertificadoPorNumeroSerie(numeroSerie: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.API_URL}/certificados/publico/${numeroSerie}`,
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Avaliações ----------

  async avaliarCurso(data: { cursoId: number; nota: number; comentario: string }): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(`${this.API_URL}/avaliacoes`, data, headers);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMinhaAvaliacao(cursoId: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${this.API_URL}/avaliacoes/curso/${cursoId}/minha`,
        headers,
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async atualizarAvaliacao(
    avaliacaoId: number,
    data: { nota: number; comentario: string; cursoId: number },
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.patch(`${this.API_URL}/avaliacoes/${avaliacaoId}`, data, headers);
    } catch (error) {
      this.handleError(error);
    }
  }

  async listarAvaliacoesPorCurso(cursoId: number): Promise<Review[]> {
    try {
      const response = await axios.get(`${this.API_URL}/avaliacoes/curso/${cursoId}`);
      return Array.isArray(response.data)
        ? response.data.map((review: any) => this.mapReview(review))
        : [];
    } catch (error) {
      this.handleError(error);
    }
  }

  // ---------- Dashboard ----------

  async getDashboard(idUsuario: number): Promise<DashboardData> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${this.API_URL}/usuarios/${idUsuario}/dashboard`,
        headers,
      );
      return this.mapDashboard(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default new ApiService();
