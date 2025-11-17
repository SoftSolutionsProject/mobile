import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Course, RootStackParamList } from '../types';
import { useCourses } from '../contexts/CoursesContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const placeholderCourseImage = require('../assets/images/cursos/desenvolvimento-web.jpg');
const placeholderInstructorImage = require('../assets/images/perfil.png');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { courses, isLoadingCourses, coursesError, refreshCourses } = useCourses();

  useFocusEffect(
    useCallback(() => {
      refreshCourses();
    }, [refreshCourses]),
  );

  const featuredCourses = useMemo(() => courses.slice(0, 6), [courses]);
  const showLoading = isLoadingCourses && featuredCourses.length === 0;
  const showError = Boolean(coursesError) && featuredCourses.length === 0;

  const features = useMemo(
    () => [
      {
        icon: 'infinite',
        title: 'Acesso Ilimitado',
        description: 'Estude no seu ritmo, com conteúdo disponível 24 horas.',
      },
      {
        icon: 'school',
        title: 'Certificados Oficiais',
        description: 'Comprove seu conhecimento com certificados reconhecidos.',
      },
      {
        icon: 'people',
        title: 'Instrutores Especialistas',
        description: 'Aprenda com profissionais atuantes no mercado.',
      },
      {
        icon: 'analytics',
        title: 'Dashboard Inteligente',
        description: 'Acompanhe seu progresso e conquistas em tempo real.',
      },
    ],
    [],
  );

  const formatDuration = (tempoCurso: number) =>
    tempoCurso ? `${tempoCurso}h` : 'Carga horária não informada';

  const formatCategory = (categoria: string) =>
    categoria && categoria.length > 0 ? categoria : 'Categoria';

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() =>
        navigation.navigate('DetalhesCurso', { courseId: String(course.id) })
      }
    >
      <View style={styles.courseCardHeader}>
        <Image
          source={
            course.imagemCurso
              ? { uri: course.imagemCurso }
              : placeholderCourseImage
          }
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>
            {formatCategory(course.categoria)}
          </Text>
        </View>
        {course.avaliacao ? (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#ffc107" />
            <Text style={styles.ratingText}>{course.avaliacao.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.courseCardBody}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.nomeCurso}
        </Text>
        <Text style={styles.courseDescription} numberOfLines={3}>
          {course.descricaoCurta || 'Descrição indisponível.'}
        </Text>

        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name='time' size={14} color='#666' />
            <Text style={styles.metaText}>{formatDuration(course.tempoCurso)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name='layers' size={14} color='#666' />
            <Text style={styles.metaText}>
              {course.modulos?.length ?? 0} módulo{(course.modulos?.length ?? 0) === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View style={styles.instructorContainer}>
          <Image source={placeholderInstructorImage} style={styles.instructorImage} />
          <Text style={styles.instructorName} numberOfLines={1}>
            {course.professor}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Transforme sua jornada profissional com a Soft Solutions
            </Text>
            <Text style={styles.heroSubtitle}>
              Aprenda com especialistas, acompanhe seu progresso e conquiste certificados com reconhecimento no mercado.
            </Text>

            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>+1000</Text>
                <Text style={styles.metricLabel}>Alunos Impactados</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>60+</Text>
                <Text style={styles.metricLabel}>Cursos Disponíveis</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>24/7</Text>
                <Text style={styles.metricLabel}>Suporte Especializado</Text>
              </View>
            </View>

            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('CursosLista')}
              >
                <Text style={styles.ctaButtonText}>Explorar Cursos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos em Destaque</Text>
            <Text style={styles.sectionSubtitle}>
              Confira os cursos mais buscados pela nossa comunidade
            </Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CursosLista')}
            >
              <Text style={styles.viewAllButtonText}>Ver catálogo completo</Text>
              <Ionicons name="arrow-forward" size={16} color="#4a9eff" />
            </TouchableOpacity>
          </View>

          {showLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a9eff" />
              <Text style={styles.loadingText}>Carregando cursos...</Text>
            </View>
          ) : showError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={32} color="#e74c3c" />
              <Text style={styles.errorTitle}>Não foi possível carregar os cursos</Text>
              <Text style={styles.errorMessage}>{coursesError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refreshCourses(true)}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coursesContainer}
            >
              {featuredCourses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="school-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>Nenhum curso encontrado</Text>
                  <Text style={styles.emptySubtitle}>
                    Assim que novos cursos estiverem disponíveis, eles aparecerão aqui.
                  </Text>
                </View>
              ) : (
                featuredCourses.map(renderCourseCard)
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por que estudar com a gente?</Text>
            <Text style={styles.sectionSubtitle}>
              Uma plataforma completa para acelerar sua carreira
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={feature.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color="#4a9eff" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
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
  heroSection: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#d5d5d5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  ctaButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    flex: 1,
    maxWidth: 180,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#4a9eff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    flex: 1,
    maxWidth: 180,
  },
  secondaryButtonText: {
    color: '#4a9eff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#d0d0d0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b2b2b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  coursesContainer: {
    paddingRight: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.68,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseCardHeader: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  courseBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  courseBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  courseCardBody: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  instructorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    fontSize: 13,
    color: '#444',
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#1e1e1e',
    padding: 18,
    borderRadius: 16,
    width: (width - 56) / 2,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2b2b2b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a9eff',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#c0c0c0',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#4a9eff',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    color: '#d0d0d0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    width: width * 0.8,
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#c0c0c0',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeScreen;
