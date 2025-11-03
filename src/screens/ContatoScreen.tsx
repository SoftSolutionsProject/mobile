import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';
import { validateEmail, validatePhone, formatPhone } from '../utils/validations';
import ApiService from '../services/ApiService';
import NotificationService from '../services/NotificationService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ContatoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    setErrorMessage('');

    // Validação do nome
    if (!formData.nome.trim()) {
      setErrorMessage('Nome é obrigatório');
      return false;
    }
    if (formData.nome.trim().length < 2) {
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

    // Validação do telefone (opcional, mas se preenchido deve ser válido)
    if (formData.telefone.trim() && !validatePhone(formData.telefone)) {
      setErrorMessage('Formato de telefone inválido');
      return false;
    }

    // Validação do assunto
    if (!formData.assunto.trim()) {
      setErrorMessage('Assunto é obrigatório');
      return false;
    }
    if (formData.assunto.trim().length < 5) {
      setErrorMessage('Assunto deve ter pelo menos 5 caracteres');
      return false;
    }

    // Validação da mensagem
    if (!formData.mensagem.trim()) {
      setErrorMessage('Mensagem é obrigatória');
      return false;
    }
    if (formData.mensagem.trim().length < 10) {
      setErrorMessage('Mensagem deve ter pelo menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Aplica formatação específica para telefone
    if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await ApiService.enviarEmailSuporte({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        assunto: formData.assunto.trim(),
        mensagem: `${formData.mensagem.trim()}\n\nTelefone para contato: ${
          formData.telefone || 'não informado'
        }`,
      });

      NotificationService.showSuccess('Mensagem enviada com sucesso!');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: '',
      });
      navigation.navigate('Home');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem de contato:', error);
      NotificationService.showError(
        error?.message || 'Não foi possível enviar sua mensagem. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const contactInfo = [
    {
      icon: 'mail',
      title: 'Email',
      value: 'contato@softsolutions.com',
      action: () => openLink('mailto:contato@softsolutions.com'),
    },
    {
      icon: 'call',
      title: 'Telefone',
      value: '(11) 99999-9999',
      action: () => openLink('tel:+5511999999999'),
    },
    {
      icon: 'location',
      title: 'Endereço',
      value: 'São Paulo, SP - Brasil',
      action: null,
    },
    {
      icon: 'time',
      title: 'Horário de Atendimento',
      value: 'Seg-Sex: 8h às 18h',
      action: null,
    },
  ];

  return (
    <View style={styles.container}>
      <Header showBackButton title="Contato" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Contact Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Envie sua Mensagem</Text>
              <View style={styles.form}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.nome}
                      onChangeText={(value) => handleInputChange('nome', value)}
                      placeholder="Seu nome completo"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      placeholder="seu@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.telefone}
                    onChangeText={(value) => handleInputChange('telefone', value)}
                    placeholder="(11) 99999-9999"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Assunto *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.assunto}
                    onChangeText={(value) => handleInputChange('assunto', value)}
                    placeholder="Qual o assunto da sua mensagem?"
                    autoCapitalize="sentences"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mensagem *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.mensagem}
                    onChangeText={(value) => handleInputChange('mensagem', value)}
                    placeholder="Descreva sua dúvida ou sugestão..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                  />
                </View>

                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Enviar Mensagem</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.contactInfoSection}>
              <Text style={styles.sectionTitle}>Informações de Contato</Text>
              <View style={styles.contactInfoGrid}>
                {contactInfo.map((info, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactInfoItem}
                    onPress={info.action || undefined}
                    disabled={!info.action}
                  >
                    <View style={styles.contactInfoIcon}>
                      <Ionicons name={info.icon as any} size={24} color="#4a9eff" />
                    </View>
                    <View style={styles.contactInfoContent}>
                      <Text style={styles.contactInfoTitle}>{info.title}</Text>
                      <Text style={styles.contactInfoValue}>{info.value}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.faqSection}>
              <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
              <View style={styles.faqList}>
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Como posso me inscrever em um curso?</Text>
                  <Text style={styles.faqAnswer}>
                    Basta navegar até a seção de cursos, escolher o curso desejado e clicar em "Inscrever-se".
                  </Text>
                </View>
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Os cursos são gratuitos?</Text>
                  <Text style={styles.faqAnswer}>
                    Oferecemos tanto cursos gratuitos quanto pagos. Cada curso tem sua própria política de preços.
                  </Text>
                </View>
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Como funciona o certificado?</Text>
                  <Text style={styles.faqAnswer}>
                    Após concluir um curso, você receberá um certificado digital que pode ser baixado e compartilhado.
                  </Text>
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
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 20,
  },
  contactInfoSection: {
    marginBottom: 30,
  },
  contactInfoGrid: {
    gap: 15,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfoIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f8ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 5,
  },
  contactInfoValue: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputGroup: {
    flex: 1,
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
  textArea: {
    height: 100,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#9cc7ff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  faqSection: {
    marginBottom: 30,
  },
  faqList: {
    gap: 15,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ContatoScreen;
