import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RecuperarSenhaScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleRecuperarSenha = () => {
    setErrorMessage('');
    
    if (!email.trim()) {
      setErrorMessage('Email é obrigatório');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Formato de email inválido');
      return;
    }

    // Mock recuperação de senha - em produção seria uma chamada à API
    Alert.alert(
      'Email Enviado',
      'Um link para redefinir sua senha foi enviado para seu email.',
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
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
            <View style={styles.formContainer}>
              <View style={styles.formContent}>
                <Text style={styles.title}>RECUPERAR SENHA</Text>
                <Text style={styles.subtitle}>
                  Digite seu email para receber um link de recuperação de senha
                </Text>
                
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Digite seu email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}

                  <TouchableOpacity style={styles.button} onPress={handleRecuperarSenha}>
                    <Text style={styles.buttonText}>Enviar Link de Recuperação</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.backLinkText}>Voltar ao Login</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  formContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a9eff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
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
    width: '100%',
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
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    color: '#4a9eff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RecuperarSenhaScreen;
