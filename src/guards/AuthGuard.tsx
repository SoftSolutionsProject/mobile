import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <Ionicons name="lock-closed" size={64} color="#4a9eff" />
          <Text style={styles.title}>Acesso Restrito</Text>
          <Text style={styles.subtitle}>
            Você precisa estar logado para acessar esta página
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#4a9eff',
    fontSize: 16,
    marginTop: 15,
  },
  authRequiredContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: 350,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a9eff',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthGuard;
