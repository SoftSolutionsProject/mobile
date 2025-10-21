import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from '../config/environment';

export interface LoginResponse {
  usuario: any;
  access_token: string;
}

export interface DashboardResponse {
  totalCursosInscritos: number;
  totalCertificados: number;
  tempoTotalEstudoMinutos: number;
  diasAtivosEstudo: number;
  ultimoDiaAtividade: string;
  diasConsecutivosEstudo: number;
  sequenciaAtualDiasConsecutivos: number;
}

class ApiService {
  private readonly API_URL = environment.apiUrl;

  constructor() {
    // Configurar timeout global do axios
    axios.defaults.timeout = 10000; // 10 segundos
  }

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
  }

  private handleError(error: any) {
    console.error('Erro ApiService:', error);
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw new Error('Erro de conexão. Verifique sua internet e se o servidor está rodando.');
    }
    
    if (error.response) {
      // Servidor respondeu com erro
      throw error;
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      throw new Error('Servidor não está respondendo. Verifique se o backend está rodando na porta 4000.');
    } else {
      // Algo deu errado na configuração da requisição
      throw new Error('Erro na configuração da requisição.');
    }
  }

  // ---------- AUTENTICAÇÃO ----------

  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.API_URL}/usuarios/login`,
        { email, senha }
      );
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('_idUser', response.data.usuario.id.toString());
      await AsyncStorage.setItem('tipoUser', response.data.usuario.tipo);
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async cadastrarUsuario(data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.API_URL}/usuarios/cadastro`, data);
      console.log('Usuário cadastrado com sucesso');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('_idUser');
    await AsyncStorage.removeItem('tipoUser');
  }

  // ---------- PERFIL ----------

  async getProfile(userId: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/usuarios/${userId}`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateProfile(userId: number, userData: any): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${this.API_URL}/usuarios/${userId}`, userData, headers);
      console.log('Perfil atualizado com sucesso');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- CURSOS ----------

  async listarCursos(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(`${this.API_URL}/cursos`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obterCurso(id: number): Promise<any> {
    try {
      const response = await axios.get<any>(`${this.API_URL}/cursos/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obterAulasCurso(idCurso: number): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(`${this.API_URL}/cursos/${idCurso}/aulas`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obterQuantidadeInscritos(idCurso: number): Promise<{ quantidadeInscritos: number }> {
    try {
      const response = await axios.get<{ quantidadeInscritos: number }>(
        `${this.API_URL}/cursos/${idCurso}/inscritos`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- INSCRIÇÕES ----------

  async listarInscricoesUsuario(): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<any[]>(`${this.API_URL}/inscricoes/usuario`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async inscreverUsuario(idCurso: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.API_URL}/inscricoes/cursos/${idCurso}`, {}, headers);
      console.log('Inscrição realizada com sucesso');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async cancelarInscricao(idInscricao: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${this.API_URL}/inscricoes/${idInscricao}/cancelar`, headers);
      console.log('Inscrição cancelada');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async concluirAula(idInscricao: number, idAula: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${this.API_URL}/inscricoes/${idInscricao}/concluir-aula/${idAula}`,
        {},
        headers
      );
      console.log('Aula concluída');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async desmarcarAula(idInscricao: number, idAula: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${this.API_URL}/inscricoes/${idInscricao}/desmarcar-aula/${idAula}`,
        {},
        headers
      );
      console.log('Aula desmarcada como concluída');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obterProgresso(idInscricao: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/inscricoes/${idInscricao}/progresso`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- SUPORTE / EMAIL ----------

  async enviarEmailSuporte(dados: any): Promise<any> {
    try {
      const response = await axios.post(`${this.API_URL}/email/suporte`, dados);
      console.log('Email de suporte enviado');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- PROGRESSO ----------

  mapearInscricoes(inscricoes: any[]): any[] {
    return inscricoes.map(insc => {
      let statusInscricao = 0;
      const progresso = insc.progressoAulas || [];

      if (progresso.some((p: any) => p.concluida === true)) {
        statusInscricao = 1;
      }
      if (progresso.every((p: any) => p.concluida === true) && progresso.length > 0) {
        statusInscricao = 2;
      }

      return {
        id: insc.id,
        curso: insc.curso,
        statusInscricao,
      };
    });
  }

  async listarModulosEAulasDoCurso(idCurso: number): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<any[]>(`${this.API_URL}/cursos/${idCurso}/aulas`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- CERTIFICADOS ----------

  async getCertificado(idInscricao: number): Promise<Blob> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/certificados/${idInscricao}`, {
        ...headers,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async verificarCertificado(idInscricao: number): Promise<Blob> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/certificados/${idInscricao}`, {
        ...headers,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async consultarCertificadoPorNumeroSerie(numeroSerie: string): Promise<any> {
    try {
      const response = await axios.get(`${this.API_URL}/certificados/publico/${numeroSerie}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- AVALIAÇÕES ----------

  async avaliarCurso(data: any): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.API_URL}/avaliacoes`, data, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getMinhaAvaliacao(cursoId: number): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.API_URL}/avaliacoes/curso/${cursoId}/minha`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async atualizarAvaliacao(avaliacaoId: number, data: any): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.patch(`${this.API_URL}/avaliacoes/${avaliacaoId}`, data, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async listarAvaliacoesPorCurso(cursoId: number): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<any[]>(`${this.API_URL}/avaliacoes/curso/${cursoId}`, headers);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ---------- DASHBOARD ----------

  async getDashboard(idUsuario: number): Promise<DashboardResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<DashboardResponse>(
        `${this.API_URL}/usuarios/${idUsuario}/dashboard`,
        headers
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default new ApiService();
