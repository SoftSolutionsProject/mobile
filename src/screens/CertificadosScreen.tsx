import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { Certificate, Enrollment, RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CertificadosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, user } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCertificates();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.listarInscricoesUsuario();
      setEnrollments(response);

      const completed = response.filter((item) => item.status === 'concluido');

      const mappedCertificates: Certificate[] = completed.map((enrollment) => ({
        id: String(enrollment.id),
        courseName: enrollment.curso.nomeCurso,
        studentName: user?.nomeUsuario ?? 'Aluno',
        issueDate:
          enrollment.dataConclusao ?? enrollment.dataInscricao ?? new Date().toISOString(),
        inscriptionId: enrollment.id,
        status: enrollment.status,
      }));

      setCertificates(mappedCertificates);
    } catch (error: any) {
      console.error('Erro ao carregar certificados:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar seus certificados agora.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsModalVisible(true);
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      setIsProcessing(true);
      const blob = await ApiService.baixarCertificado(certificate.inscriptionId);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          const fileName = `certificado_${certificate.courseName.replace(/\s+/g, '_')}.pdf`;
          const fileUri = FileSystem.documentDirectory + fileName;

          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar certificado',
            });
          } else {
            Alert.alert('Sucesso', 'Certificado salvo nos seus arquivos.');
          }
        } catch (error) {
          console.error('Erro ao processar certificado:', error);
          Alert.alert('Erro', 'Não foi possível processar o certificado.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error: any) {
      console.error('Erro ao baixar certificado:', error);
      setIsProcessing(false);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível baixar o certificado. Certifique-se de ter concluído todas as aulas.',
      );
    }
  };

  const handleDownload = () => {
    if (!selectedCertificate) return;
    downloadCertificate(selectedCertificate);
  };

  const handleShare = () => {
    if (!selectedCertificate) return;
    downloadCertificate(selectedCertificate);
  };

  const completionRate = useMemo(() => {
    if (enrollments.length === 0) {
      return 0;
    }
    const completed = enrollments.filter((item) => item.status === 'concluido').length;
    return Math.round((completed / enrollments.length) * 100);
  }, [enrollments]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Meus certificados" />
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed" size={48} color="#4a9eff" />
          <Text style={styles.centerTitle}>Faça login para acessar seus certificados.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Meus certificados" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.helperText}>Carregando seus certificados...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Meus certificados" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{certificates.length}</Text>
              <Text style={styles.statLabel}>Certificados conquistados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Taxa de conclusão</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certificados disponíveis</Text>
            <Text style={styles.sectionSubtitle}>
              Baixe e compartilhe suas conquistas com um toque.
            </Text>
          </View>

          {certificates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={64} color="#4a9eff" />
              <Text style={styles.emptyTitle}>Você ainda não possui certificados.</Text>
              <Text style={styles.helperText}>
                Finalize um curso para liberar seu certificado de conclusão.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('CursosLista')}
              >
                <Text style={styles.primaryButtonText}>Explorar cursos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            certificates.map((certificate) => (
              <TouchableOpacity
                key={certificate.id}
                style={styles.certificateCard}
                onPress={() => handleOpenCertificate(certificate)}
              >
                <View style={styles.certificateIcon}>
                  <Ionicons name="document-text" size={24} color="#4a9eff" />
                </View>
                <View style={styles.certificateInfo}>
                  <Text style={styles.certificateCourse}>{certificate.courseName}</Text>
                  <Text style={styles.certificateDate}>
                    Emitido em{' '}
                    {new Date(certificate.issueDate).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ))
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Como funcionam os certificados?</Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow
              icon="shield-checkmark"
              text="Certificados válidos e verificáveis pelo código único."
            />
            <InfoRow
              icon="time"
              text="Liberação automática ao concluir 100% das aulas."
            />
            <InfoRow
              icon="share-social"
              text="Compartilhe em redes sociais ou faça download em PDF."
            />
          </View>
        </View>
      </ScrollView>
      <Footer />

      <Modal
        transparent
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificado</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedCertificate ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalCourse}>{selectedCertificate.courseName}</Text>
                <Text style={styles.modalStudent}>{selectedCertificate.studentName}</Text>
                <Text style={styles.modalDate}>
                  Emitido em{' '}
                  {new Date(selectedCertificate.issueDate).toLocaleDateString('pt-BR')}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.modalButton]}
                    onPress={handleDownload}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="download" size={18} color="#fff" />
                        <Text style={styles.primaryButtonText}>Baixar PDF</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.modalButton]}
                    onPress={handleShare}
                    disabled={isProcessing}
                  >
                    <Ionicons name="share-social" size={18} color="#4a9eff" />
                    <Text style={styles.secondaryButtonText}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow: React.FC<{ icon: any; text: string }> = ({ icon, text }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#4a9eff" />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  centerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  helperText: {
    color: '#c0c0c0',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4a9eff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2b2b2b',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#c0c0c0',
    marginTop: 6,
  },
  sectionHeader: {
    marginBottom: 16,
    gap: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#a0a0a0',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    padding: 18,
    marginBottom: 12,
    gap: 16,
  },
  certificateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2b2b2b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateInfo: {
    flex: 1,
    gap: 4,
  },
  certificateCourse: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  certificateDate: {
    color: '#c0c0c0',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    padding: 18,
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: '#c0c0c0',
    fontSize: 13,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2b2b2b',
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  modalCourse: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalStudent: {
    fontSize: 14,
    color: '#666',
  },
  modalDate: {
    fontSize: 13,
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default CertificadosScreen;
