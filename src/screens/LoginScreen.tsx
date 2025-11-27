import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import NotificationService from '../services/NotificationService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const INPUT_TEXT_COLOR = '#111827';
const PLACEHOLDER_COLOR = '#6b7280';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Email é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Email deve ser válido');
      return false;
    }
    if (!senha.trim()) {
      setErrorMessage('Senha é obrigatória');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoggingIn(true);
      await login(email, senha);
      NotificationService.showSuccess('Login realizado com sucesso!');
      navigation.navigate('Dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        setErrorMessage('Email ou senha incorretos');
        NotificationService.showError('Email ou senha incorretos');
      } else if (error.response?.status === 400) {
        setErrorMessage('Dados inválidos. Verifique suas informações.');
        NotificationService.showError('Dados inválidos. Verifique suas informações.');
      } else {
        setErrorMessage('Erro ao fazer login. Tente novamente.');
        NotificationService.showError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header showBackButton />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Background Image - Hidden on mobile */}
            {/* Background Image - Hidden on mobile */}
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/images/login/bg-login.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.formContent}>
                <Text style={styles.title}>LOGIN</Text>
                
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Digite seu email"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      selectionColor="#4a9eff"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>SENHA</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Digite sua senha"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        selectionColor="#4a9eff"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}

                  <TouchableOpacity 
                    style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]} 
                    onPress={handleLogin}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Entrar</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.linksContainer}>
                    <TouchableOpacity
                      style={styles.link}
                      onPress={() => navigation.navigate('RecuperarSenha')}
                    >
                      <Text style={styles.linkText}>Esqueci minha senha!</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.link}
                      onPress={() => navigation.navigate('Cadastro')}
                    >
                      <Text style={styles.linkText}>Não possuo cadastro!</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  imageContainer: {
    display: 'none', // Hidden on mobile
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContent: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a9eff',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: INPUT_TEXT_COLOR,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: INPUT_TEXT_COLOR,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  linksContainer: {
    alignItems: 'center',
  },
  link: {
    marginBottom: 10,
  },
  linkText: {
    color: '#4a9eff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
