import * as SQLite from 'expo-sqlite';

export interface ProfileImage {
  userId: string;
  imageUri: string;
  createdAt: string;
}

class ProfileImageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitializing = false;

  async initDatabase(): Promise<void> {
    if (this.db) {
      return; // Já inicializado
    }

    if (this.isInitializing) {
      // Aguardar inicialização em andamento
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.isInitializing = true;
      this.db = await SQLite.openDatabaseAsync('profile_images.db');
      
      if (!this.db) {
        throw new Error('Falha ao criar conexão com o banco de dados');
      }
      
      // Criar tabela se não existir
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS profile_images (
          userId TEXT PRIMARY KEY,
          imageUri TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
      `);
      
      console.log('Banco de dados SQLite inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      this.db = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async saveProfileImage(userId: string, imageUri: string): Promise<void> {
    if (!userId || !imageUri) {
      throw new Error('userId e imageUri são obrigatórios');
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      throw new Error('Falha ao inicializar banco de dados');
    }

    try {
      const now = new Date().toISOString();
      
      await this.db.runAsync(
        `INSERT OR REPLACE INTO profile_images (userId, imageUri, createdAt) VALUES (?, ?, ?)`,
        [userId, imageUri, now]
      );
      
      console.log('Imagem de perfil salva com sucesso para userId:', userId);
    } catch (error) {
      console.error('Erro ao salvar imagem de perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao salvar imagem de perfil: ${message}`);
    }
  }

  async getProfileImage(userId: string): Promise<string | null> {
    if (!userId) {
      console.warn('userId é obrigatório para buscar imagem de perfil');
      return null;
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      console.error('Falha ao inicializar banco de dados');
      return null;
    }

    try {
      const result = await this.db.getFirstAsync<ProfileImage>(
        `SELECT * FROM profile_images WHERE userId = ?`,
        [userId]
      );

      return result?.imageUri || null;
    } catch (error) {
      console.error('Erro ao buscar imagem de perfil:', error);
      return null;
    }
  }

  async deleteProfileImage(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('userId é obrigatório para deletar imagem de perfil');
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      throw new Error('Falha ao inicializar banco de dados');
    }

    try {
      await this.db.runAsync(
        `DELETE FROM profile_images WHERE userId = ?`,
        [userId]
      );
      
      console.log('Imagem de perfil deletada com sucesso para userId:', userId);
    } catch (error) {
      console.error('Erro ao deletar imagem de perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao deletar imagem de perfil: ${message}`);
    }
  }

  async getAllProfileImages(): Promise<ProfileImage[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      console.error('Falha ao inicializar banco de dados');
      return [];
    }

    try {
      const result = await this.db.getAllAsync<ProfileImage>(
        `SELECT * FROM profile_images ORDER BY createdAt DESC`
      );

      return result || [];
    } catch (error) {
      console.error('Erro ao buscar todas as imagens de perfil:', error);
      return [];
    }
  }
}

export default new ProfileImageService();
