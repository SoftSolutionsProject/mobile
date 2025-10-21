import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';

interface User {
  id: string;
  nomeUsuario: string;
  email: string;
  cpfUsuario: string;
  tipo: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('_idUser');
      const storedTipoUser = await AsyncStorage.getItem('tipoUser');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        
        // Buscar dados completos do usuário
        try {
          const userData = await ApiService.getProfile(parseInt(storedUserId));
          setUser({
            id: userData.id.toString(),
            nomeUsuario: userData.nomeUsuario,
            email: userData.email,
            cpfUsuario: userData.cpfUsuario,
            tipo: storedTipoUser || 'aluno',
          });
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          // Se não conseguir carregar os dados, limpar o storage
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('_idUser');
    await AsyncStorage.removeItem('tipoUser');
    setUser(null);
    setToken(null);
  };

  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(email, senha);
      
      setToken(response.access_token);
      setUser({
        id: response.usuario.id.toString(),
        nomeUsuario: response.usuario.nomeUsuario,
        email: response.usuario.email,
        cpfUsuario: response.usuario.cpfUsuario,
        tipo: response.usuario.tipo,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await ApiService.logout();
      await clearAuth();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
