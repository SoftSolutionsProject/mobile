import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, DashboardData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data - em produção viria da API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: DashboardData = {
          totalCursosInscritos: 5,
          totalCertificados: 3,
          tempoTotalEstudoMinutos: 1250,
          diasAtivosEstudo: 45,
          ultimoDiaAtividade: '2024-01-20',
          diasConsecutivosEstudo: 7,
          sequenciaAtualDiasConsecutivos: 3,
        };
        
        setDashboardData(mockData);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string = '#125887') => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const renderHighlightCard = (title: string, value: string | number, icon: string) => (
    <View style={[styles.statCard, styles.highlightCard]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color="#2ecc71" />
      </View>
      <Text style={[styles.statValue, styles.highlightValue]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Dashboard" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando dashboard...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Dashboard" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError('');
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Dashboard" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.welcomeSubtitle}>
              Acompanhe seu progresso e continue aprendendo
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total de Cursos Inscritos',
              dashboardData?.totalCursosInscritos || 0,
              'book',
              '#125887'
            )}
            {renderStatCard(
              'Total de Certificados',
              dashboardData?.totalCertificados || 0,
              'school',
              '#2ecc71'
            )}
            {renderStatCard(
              'Tempo Total de Estudo',
              formatTime(dashboardData?.tempoTotalEstudoMinutos || 0),
              'time',
              '#e67e22'
            )}
            {renderStatCard(
              'Dias Ativos de Estudo',
              dashboardData?.diasAtivosEstudo || 0,
              'calendar',
              '#9b59b6'
            )}
            {renderStatCard(
              'Último Dia de Atividade',
              formatDate(dashboardData?.ultimoDiaAtividade || ''),
              'today',
              '#34495e'
            )}
            {renderHighlightCard(
              'Dias Consecutivos de Estudo',
              dashboardData?.diasConsecutivosEstudo || 0,
              'trending-up'
            )}
          </View>

          {/* Current Streak */}
          <View style={styles.streakSection}>
            <Text style={styles.sectionTitle}>Sequência Atual</Text>
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={32} color="#e74c3c" />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>
                  {dashboardData?.sequenciaAtualDiasConsecutivos || 0} dias
                </Text>
                <Text style={styles.streakText}>
                  Sequência atual de dias com estudo
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('CursosLista')}
              >
                <Ionicons name="book" size={24} color="#125887" />
                <Text style={styles.actionText}>Ver Cursos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Certificados')}
              >
                <Ionicons name="school" size={24} color="#125887" />
                <Text style={styles.actionText}>Meus Certificados</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Profile', { userId: '1' })}
              >
                <Ionicons name="person" size={24} color="#125887" />
                <Text style={styles.actionText}>Meu Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Contato')}
              >
                <Ionicons name="help-circle" size={24} color="#125887" />
                <Text style={styles.actionText}>Suporte</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.activityText}>
                  Concluiu a aula "Variáveis e Tipos de Dados"
                </Text>
                <Text style={styles.activityTime}>2 horas atrás</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Ionicons name="school" size={20} color="#125887" />
                <Text style={styles.activityText}>
                  Recebeu certificado de "Fundamentos em Python"
                </Text>
                <Text style={styles.activityTime}>1 dia atrás</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Ionicons name="play-circle" size={20} color="#e67e22" />
                <Text style={styles.activityText}>
                  Iniciou o curso "React Native Para Mobile"
                </Text>
                <Text style={styles.activityTime}>3 dias atrás</Text>
              </View>
            </View>
          </View>

          {/* Info Button */}
          <View style={styles.infoSection}>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => {
                // Lógica para abrir explicações
                console.log('Abrir explicações');
              }}
            >
              <Ionicons name="information-circle" size={20} color="#125887" />
              <Text style={styles.infoButtonText}>Entenda os dados exibidos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const { width } = Dimensions.get('window');

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: '#4a9eff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: (width - 60) / 2,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highlightCard: {
    backgroundColor: '#f0f8f0',
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  statIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f8ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  highlightValue: {
    color: '#2ecc71',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  streakSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 15,
  },
  streakCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakIcon: {
    marginRight: 15,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  streakText: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: (width - 60) / 2,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#4a9eff',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  activitySection: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#125887',
  },
  infoButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default DashboardScreen;
