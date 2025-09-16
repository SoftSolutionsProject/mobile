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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  validateCPF, 
  formatCPF, 
  validateEmail, 
  validatePassword,
  unformatCPF 
} from '../utils/validations';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CadastroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    nomeUsuario: '',
    email: '',
    senha: '',
    cpfUsuario: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validateForm = () => {
    setErrorMessage('');
    setPasswordErrors([]);

    // Validação do nome
    if (!formData.nomeUsuario.trim()) {
      setErrorMessage('Nome é obrigatório');
      return false;
    }
    if (formData.nomeUsuario.trim().length < 2) {
      setErrorMessage('Nome deve ter pelo menos 2 caracteres');
      return false;
    }

    // Validação do email
    if (!formData.email.trim()) {
      setErrorMessage('Email é obrigatório');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Formato de email inválido');
      return false;
    }

    // Validação da senha
    if (!formData.senha.trim()) {
      setErrorMessage('Senha é obrigatória');
      return false;
    }
    const passwordValidation = validatePassword(formData.senha);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      setErrorMessage('Senha não atende aos critérios de segurança');
      return false;
    }

    // Validação do CPF
    if (!formData.cpfUsuario.trim()) {
      setErrorMessage('CPF é obrigatório');
      return false;
    }
    const cleanCPF = unformatCPF(formData.cpfUsuario);
    if (!validateCPF(cleanCPF)) {
      setErrorMessage('CPF inválido');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Aplica formatação específica para cada campo
    if (field === 'cpfUsuario') {
      formattedValue = formatCPF(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    setErrorMessage('');
    setPasswordErrors([]);
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, senha: value }));
    setErrorMessage('');
    
    // Validação em tempo real da senha
    if (value.length > 0) {
      const passwordValidation = validatePassword(value);
      setPasswordErrors(passwordValidation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleCadastro = () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    // Mock cadastro - em produção seria uma chamada à API
    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
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
                source={require('../assets/images/cadastro/bg-cadastro.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            </View>

            {/* Cadastro Form */}
            <View style={styles.formContainer}>
              <View style={styles.formContent}>
                <Text style={styles.title}>CADASTRE-SE</Text>
                
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      value={formData.nomeUsuario}
                      onChangeText={(value) => handleInputChange('nomeUsuario', value)}
                      placeholder="Nome"
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      value={formData.senha}
                      onChangeText={handlePasswordChange}
                      placeholder="Senha"
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {passwordErrors.length > 0 && (
                      <View style={styles.passwordErrorsContainer}>
                        {passwordErrors.map((error, index) => (
                          <Text key={index} style={styles.passwordErrorText}>
                            • {error}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.input}
                      value={formData.cpfUsuario}
                      onChangeText={(value) => handleInputChange('cpfUsuario', value)}
                      placeholder="CPF (000.000.000-00)"
                      keyboardType="numeric"
                      maxLength={14}
                    />
                  </View>

                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}

                  <TouchableOpacity style={styles.cadastroButton} onPress={handleCadastro}>
                    <Text style={styles.cadastroButtonText}>Cadastrar</Text>
                  </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordErrorsContainer: {
    marginTop: 8,
    paddingHorizontal: 5,
  },
  passwordErrorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 16,
  },
  cadastroButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  cadastroButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CadastroScreen;
