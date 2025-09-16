import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Certificate } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CertificadosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data - em produção viria da API
  const certificates: Certificate[] = [
    {
      id: '1',
      courseName: 'Fundamentos em Python',
      studentName: 'João Silva',
      issueDate: '2024-01-15',
      certificateUrl: 'https://example.com/certificate1.pdf',
    },
    {
      id: '2',
      courseName: 'React Native Para Mobile',
      studentName: 'João Silva',
      issueDate: '2024-02-20',
      certificateUrl: 'https://example.com/certificate2.pdf',
    },
    {
      id: '3',
      courseName: 'JavaScript Avançado',
      studentName: 'João Silva',
      issueDate: '2024-03-10',
      certificateUrl: 'https://example.com/certificate3.pdf',
    },
  ];

  const handleCertificatePress = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleDownloadCertificate = () => {
    if (selectedCertificate) {
      Alert.alert(
        'Download do Certificado',
        `Certificado de ${selectedCertificate.courseName} será baixado.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleShareCertificate = () => {
    if (selectedCertificate) {
      Alert.alert(
        'Compartilhar Certificado',
        `Compartilhar certificado de ${selectedCertificate.courseName}.`,
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderCertificateCard = (certificate: Certificate) => (
    <TouchableOpacity
      key={certificate.id}
      style={styles.certificateCard}
      onPress={() => handleCertificatePress(certificate)}
    >
      <View style={styles.certificateHeader}>
        <View style={styles.certificateIcon}>
          <Ionicons name="school" size={30} color="#4a9eff" />
        </View>
        <View style={styles.certificateInfo}>
          <Text style={styles.courseName}>{certificate.courseName}</Text>
          <Text style={styles.issueDate}>
            Emitido em {formatDate(certificate.issueDate)}
          </Text>
        </View>
      </View>
      
      <View style={styles.certificateFooter}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
          <Text style={styles.statusText}>Concluído</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header showBackButton title="Meus Certificados" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{certificates.length}</Text>
              <Text style={styles.statLabel}>Certificados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Taxa de Conclusão</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2024</Text>
              <Text style={styles.statLabel}>Ano Atual</Text>
            </View>
          </View>

          {/* Certificates List */}
          <View style={styles.certificatesSection}>
            <Text style={styles.sectionTitle}>Certificados Conquistados</Text>
            {certificates.length > 0 ? (
              <View style={styles.certificatesList}>
                {certificates.map(renderCertificateCard)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>Nenhum certificado encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Complete um curso para receber seu primeiro certificado
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('CursosLista')}
                >
                  <Text style={styles.exploreButtonText}>Explorar Cursos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Sobre os Certificados</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color="#2ecc71" />
                <Text style={styles.infoText}>
                  Certificados verificáveis e reconhecidos pelo mercado
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="download" size={20} color="#4a9eff" />
                <Text style={styles.infoText}>
                  Download em PDF de alta qualidade
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="share" size={20} color="#4a9eff" />
                <Text style={styles.infoText}>
                  Compartilhamento em redes sociais e LinkedIn
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="infinite" size={20} color="#4a9eff" />
                <Text style={styles.infoText}>
                  Acesso vitalício aos seus certificados
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />

      {/* Certificate Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificado</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedCertificate && (
              <View style={styles.certificateDetails}>
                <View style={styles.certificatePreview}>
                  <Ionicons name="school" size={64} color="#4a9eff" />
                  <Text style={styles.previewTitle}>Certificado de Conclusão</Text>
                  <Text style={styles.previewCourse}>{selectedCertificate.courseName}</Text>
                </View>
                
                <View style={styles.detailsList}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Aluno:</Text>
                    <Text style={styles.detailValue}>{selectedCertificate.studentName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Curso:</Text>
                    <Text style={styles.detailValue}>{selectedCertificate.courseName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Data de Emissão:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedCertificate.issueDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDownloadCertificate}
                  >
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Baixar PDF</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={handleShareCertificate}
                  >
                    <Ionicons name="share" size={20} color="#4a9eff" />
                    <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                      Compartilhar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  certificatesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 20,
  },
  certificatesList: {
    gap: 15,
  },
  certificateCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  certificateIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f8ff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  certificateInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  issueDate: {
    fontSize: 14,
    color: '#666',
  },
  certificateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#2ecc71',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
  },
  closeButton: {
    padding: 5,
  },
  certificateDetails: {
    padding: 20,
  },
  certificatePreview: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginTop: 10,
    marginBottom: 5,
  },
  previewCourse: {
    fontSize: 14,
    color: '#666',
  },
  detailsList: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  shareButton: {
    backgroundColor: '#f0f8ff',
  },
  shareButtonText: {
    color: '#4a9eff',
  },
});

export default CertificadosScreen;
