import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { DashboardData, RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    } else {
      setIsLoading(false);
      setError('Faça login para acessar seu dashboard.');
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      if (!user) {
        throw new Error('Usuário não encontrado.');
      }
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getDashboard(Number(user.id));
      setDashboard(response);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      setError(error?.message || 'Não foi possível carregar o dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours}h ${mins}min`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Sem registro';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Sem registro';
    }
    return date.toLocaleDateString('pt-BR');
  };

  const topCourses = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    return [...dashboard.progressoPorCurso]
      .sort((a, b) => b.percentualConcluido - a.percentualConcluido)
      .slice(0, 3);
  }, [dashboard]);

  const recentStudy = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    return [...dashboard.historicoEstudo]
      .sort(
        (a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime(),
      )
      .slice(0, 5);
  }, [dashboard]);

  const pendingEvaluations = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    return dashboard.avaliacoes.filter((item) => !item.avaliacaoFeita);
  }, [dashboard]);

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <Header showBackButton title="Dashboard" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando dashboard...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.errorWrapper}>
        <Header showBackButton title="Dashboard" />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorTitle}>Ops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
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
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.welcomeSubtitle}>
              Continue evoluindo sua jornada de estudos com os insights abaixo.
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="book"
              label="Cursos inscritos"
              value={dashboard.totalCursosInscritos}
              iconColor="#4a9eff"
            />
            <StatCard
              icon="school"
              label="Certificados conquistados"
              value={dashboard.totalCertificados}
              iconColor="#2ecc71"
            />
            <StatCard
              icon="time"
              label="Tempo total de estudo"
              value={formatTime(dashboard.tempoTotalEstudoMinutos)}
              iconColor="#f39c12"
            />
            <StatCard
              icon="calendar"
              label="Dias ativos"
              value={dashboard.diasAtivosEstudo}
              iconColor="#9b59b6"
            />
            <StatCard
              icon="today"
              label="Última atividade"
              value={formatDate(dashboard.ultimoDiaAtividade)}
              iconColor="#16a085"
            />
            <StatCard
              icon="flame"
              label="Sequência atual"
              value={`${dashboard.sequenciaAtualDiasConsecutivos} dias`}
              iconColor="#e74c3c"
            />
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Seu progresso por curso"
              subtitle="Acompanhe quanto falta para concluir cada curso."
            />
            {topCourses.length === 0 ? (
              <EmptyState message="Inscreva-se em um curso para acompanhar seu progresso." />
            ) : (
              topCourses.map((courseProgress) => (
                <View key={courseProgress.cursoId} style={styles.progressRow}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressCourse}>{courseProgress.nomeCurso}</Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(courseProgress.percentualConcluido)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${courseProgress.percentualConcluido}%` },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Histórico recente de estudos"
              subtitle="Rastreie seus hábitos de estudo nos últimos dias."
            />
            {recentStudy.length === 0 ? (
              <EmptyState message="Ainda não há registro de estudos. Que tal começar hoje?" />
            ) : (
              recentStudy.map((item) => (
                <View key={item.data} style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDate}>{formatDate(item.data)}</Text>
                    <Text style={styles.historyDuration}>
                      {formatTime(item.minutosEstudados)}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Distribuição por categoria"
              subtitle="Veja como seus cursos estão distribuídos nas categorias."
            />
            {dashboard.cursosPorCategoria.length === 0 ? (
              <EmptyState message="Nenhum curso categorizado até o momento." />
            ) : (
              dashboard.cursosPorCategoria.map((category) => (
                <View key={category.categoria} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{category.categoria}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{category.total}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Avaliações pendentes"
              subtitle="Avalie os cursos concluídos para liberar certificados e ajudar outros alunos."
            />
            {pendingEvaluations.length === 0 ? (
              <EmptyState message="Nenhuma avaliação pendente. Continue estudando!" />
            ) : (
              pendingEvaluations.map((item) => (
                <TouchableOpacity
                  key={item.cursoId}
                  style={styles.pendingCard}
                  onPress={() =>
                    navigation.navigate('AvaliacaoCurso', {
                      courseId: String(item.cursoId),
                    })
                  }
                >
                  <View>
                    <Text style={styles.pendingTitle}>{item.nomeCurso}</Text>
                    <Text style={styles.pendingSubtitle}>
                      Clique para avaliar este curso.
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color="#4a9eff" />
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.actionsSection}>
            <SectionHeader
              title="Ações rápidas"
              subtitle="Continue sua jornada com um toque."
            />
            <View style={styles.actionsGrid}>
              <ActionCard
                icon="book"
                label="Explorar cursos"
                onPress={() => navigation.navigate('CursosLista')}
              />
              <ActionCard
                icon="school"
                label="Meus certificados"
                onPress={() => navigation.navigate('Certificados')}
              />
              <ActionCard
                icon="person"
                label="Meu perfil"
                onPress={() => navigation.navigate('Profile', { userId: user?.id || '' })}
              />
              <ActionCard
                icon="help-circle"
                label="Suporte"
                onPress={() => navigation.navigate('Contato')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

type StatCardProps = {
  icon: any;
  iconColor: string;
  value: string | number;
  label: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, value, label }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

type SectionHeaderProps = {
  title: string;
  subtitle: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
  </View>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyState}>
    <Ionicons name="information-circle" size={32} color="#4a9eff" />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const ActionCard: React.FC<{ icon: any; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#4a9eff" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const { width } = Dimensions.get('window');
const cardWidth = (width - 56) / 2;

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
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  errorWrapper: {
    flex: 1,
    backgroundColor: '#121212',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeCard: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2b2b2b',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#c0c0c0',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    width: cardWidth,
    backgroundColor: '#1e1e1e',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    alignItems: 'flex-start',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#c0c0c0',
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  progressRow: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressCourse: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  progressPercentage: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2b2b2b',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
  },
  historyItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyDuration: {
    color: '#c0c0c0',
    fontSize: 13,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 10,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  pendingCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pendingSubtitle: {
    color: '#c0c0c0',
    fontSize: 12,
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: cardWidth,
    backgroundColor: '#1e1e1e',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    color: '#c0c0c0',
    fontSize: 13,
  },
  emptyState: {
    backgroundColor: '#1e1e1e',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    color: '#c0c0c0',
    fontSize: 13,
    flex: 1,
  },
});

export default DashboardScreen;
