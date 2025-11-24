import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { CourseDetails, Review, RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import { CourseCache } from '../services/CourseCache';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'DetalhesCurso'>;

const placeholderCourseImage = require('../assets/images/cursos/desenvolvimento-web.jpg');
const placeholderInstructorImage = require('../assets/images/perfil.png');

const DetalhesCursoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { courseId, refreshToken } = route.params;
  const { isAuthenticated } = useAuth();
  const { enrollments, refreshEnrollments } = useCourses();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [quantityEnrolled, setQuantityEnrolled] = useState<number>(0);
  const hasCacheShown = useRef(false);
  const hasLoadedOnce = useRef(false);

  const isEnrolled = useMemo(() => {
    return enrollments.some(
      (enrollment) =>
        enrollment.curso.id === Number(courseId) && enrollment.status === 'ativo',
    );
  }, [enrollments, courseId]);

  useEffect(() => {
    loadData();
  }, [courseId, refreshToken, loadData]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshEnrollments();
    }
  }, [isAuthenticated, refreshEnrollments]);

  const loadData = useCallback(async () => {
    try {
      // Usa cache para renderizar instantaneamente ao abrir.
      if (!hasCacheShown.current) {
        const cached = CourseCache.get(Number(courseId));
        if (cached?.course) {
          setCourse((prev) => prev || cached.course);
          hasCacheShown.current = true;
        }
      }

      if (!hasCacheShown.current) {
        setIsLoading(true);
      }

      const [courseResponse, countResponse, reviewsResponse] = await Promise.all([
        ApiService.obterCurso(Number(courseId)),
        ApiService.obterQuantidadeInscritos(Number(courseId)),
        ApiService.listarAvaliacoesPorCurso(Number(courseId)),
      ]);

      const sortedModules = Array.isArray(courseResponse.modulos)
        ? [...courseResponse.modulos]
            .sort((a, b) => a.id - b.id)
            .map((module) => ({
              ...module,
              aulas: [...module.aulas].sort((a, b) => a.id - b.id),
            }))
        : [];

      setCourse({ ...courseResponse, modulos: sortedModules });
      setQuantityEnrolled(countResponse?.quantidadeInscritos ?? 0);
      setReviews(reviewsResponse);
      CourseCache.set(Number(courseId), { course: courseResponse });
      hasCacheShown.current = true;
    } catch (error: any) {
      console.error('Erro ao carregar curso:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar as informações do curso.',
      );
    } finally {
      hasLoadedOnce.current = true;
      setIsLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        return;
      }

      if (hasLoadedOnce.current) {
        loadData();
      }
    }, [isAuthenticated, loadData]),
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      Alert.alert('Faça login', 'Você precisa estar logado para se inscrever no curso.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entrar',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
      return;
    }

    try {
      setIsEnrolling(true);
      await ApiService.inscreverUsuario(Number(courseId));
      NotificationService.showSuccess('Inscrição realizada com sucesso!');
      await Promise.all([refreshEnrollments(true), loadData()]);
      navigation.navigate('AulasCurso', { courseId: String(courseId) });
    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      NotificationService.showError(
        error?.message || 'Não foi possível realizar a inscrição.',
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCancelEnrollment = () => {
    const activeEnrollment = enrollments.find(
      (item) => item.curso.id === Number(courseId) && item.status === 'ativo',
    );

    if (!activeEnrollment) {
      return;
    }

    Alert.alert(
      'Cancelar inscrição',
      'Tem certeza de que deseja cancelar sua inscrição neste curso?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelarInscricao(activeEnrollment.id);
              NotificationService.showSuccess('Inscrição cancelada.');
              await Promise.all([refreshEnrollments(true), loadData()]);
            } catch (error: any) {
              console.error('Erro ao cancelar inscrição:', error);
              NotificationService.showError(
                error?.message || 'Não foi possível cancelar a inscrição.',
              );
            }
          },
        },
      ],
    );
  };

  const handleWatchCourse = () => {
    navigation.navigate('AulasCurso', { courseId: String(courseId) });
  };

  const handleNavigateToReviews = () => {
    navigation.navigate('AvaliacaoCurso', { courseId: String(courseId) });
  };

  const handleOpenVideo = (videoUrl?: string | null) => {
    if (!videoUrl) {
      NotificationService.showInfo('Vídeo não disponível para esta aula.');
      return;
    }

    let urlToOpen = videoUrl;
    if (videoUrl.includes('youtube.com/embed/')) {
      const videoId = videoUrl.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        urlToOpen = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    Linking.openURL(urlToOpen).catch(() => {
      NotificationService.showError(
        'Não foi possível abrir o vídeo. Tente novamente mais tarde.',
      );
    });
  };

  const renderReview = (review: Review, index: number) => (
    <View key={`${review.autor}-${index}`} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{review.autor ?? 'Aluno'}</Text>
        <View style={styles.reviewStars}>
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Ionicons
              key={starIndex}
              name={starIndex < review.nota ? 'star' : 'star-outline'}
              size={16}
              color="#ffc107"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comentario}</Text>
    </View>
  );

  if (isLoading || !course) {
    return (
      <View style={styles.loadingWrapper}>
        <Header showBackButton title="Detalhes do curso" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando informações do curso...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Detalhes do curso" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.courseHeaderCard}>
            <Image
              source={
                course.imagemCurso ? { uri: course.imagemCurso } : placeholderCourseImage
              }
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.headerInfo}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.courseTitle}>{course.nomeCurso}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {course.categoria || 'Curso'}
                    </Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <Ionicons name="calendar" size={16} color="#4a9eff" />
                    <Text style={styles.badgeItemText}>
                      {course.tempoCurso
                        ? `${course.tempoCurso}h de conteúdo`
                        : 'Carga horária a definir'}
                    </Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <Ionicons name="people" size={16} color="#4a9eff" />
                    <Text style={styles.badgeItemText}>
                      {quantityEnrolled} aluno{quantityEnrolled === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.instructorRow}>
                <Image source={placeholderInstructorImage} style={styles.instructorImage} />
                <View>
                  <Text style={styles.instructorLabel}>Instrutor</Text>
                  <Text style={styles.instructorName}>{course.professor}</Text>
                </View>
              </View>

              <Text style={styles.courseDescription}>
                {course.descricaoDetalhada || course.descricaoCurta}
              </Text>

              <View style={styles.actionsRow}>
                {isEnrolled ? (
                  <>
                    <TouchableOpacity
                      style={[styles.primaryAction, styles.secondaryAction]}
                      onPress={handleCancelEnrollment}
                    >
                      <Text style={styles.secondaryActionText}>Cancelar inscrição</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.primaryAction}
                      onPress={handleWatchCourse}
                    >
                      <Text style={styles.primaryActionText}>Acessar aulas</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={handleEnroll}
                    disabled={isEnrolling}
                  >
                    <Text style={styles.primaryActionText}>
                      {isEnrolling ? 'Processando...' : 'Inscrever-se gratuitamente'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ementa do curso</Text>
              <Text style={styles.sectionSubtitle}>
                Explore os módulos e aulas disponíveis neste curso.
              </Text>
            </View>
            {course.modulos.length === 0 ? (
              <Text style={styles.emptySectionText}>
                Este curso ainda não possui módulos cadastrados.
              </Text>
            ) : (
              course.modulos.map((modulo) => (
                <View key={modulo.id} style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleTitle}>{modulo.nomeModulo}</Text>
                    <Text style={styles.moduleSubtitle}>
                      {modulo.aulas.length} aula
                      {modulo.aulas.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  {modulo.aulas.map((aula) => (
                    <View key={aula.id} style={styles.lessonRow}>
                      <View style={styles.lessonInfo}>
                        <View style={styles.lessonTextGroup}>
                          <Text style={styles.lessonTitle}>{aula.nomeAula}</Text>
                          <Text style={styles.lessonDuration}>
                            {aula.tempoAula
                              ? `${aula.tempoAula} minuto${
                                  aula.tempoAula === 1 ? '' : 's'
                                }`
                              : 'Duração não informada'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Avaliações dos alunos</Text>
              {isAuthenticated && (
                <TouchableOpacity style={styles.evaluateButton} onPress={handleNavigateToReviews}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.evaluateButtonText}>
                    {isEnrolled ? 'Avaliar curso' : 'Ver minhas avaliações'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {reviews.length === 0 ? (
              <Text style={styles.emptySectionText}>
                Este curso ainda não possui avaliações.
              </Text>
            ) : (
              reviews.map(renderReview)
            )}
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
    paddingBottom: 32,
  },
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  courseHeaderCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2b2b2b',
  },
  headerImage: {
    width: '100%',
    height: width * 0.45,
  },
  headerInfo: {
    padding: 20,
    gap: 18,
  },
  headerTitleContainer: {
    gap: 12,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  categoryBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b2b2b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  badgeItemText: {
    color: '#cfd9ff',
    fontSize: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  instructorLabel: {
    color: '#9dc7ff',
    fontSize: 12,
  },
  instructorName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  courseDescription: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#4a9eff',
    paddingVertical: 14,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  secondaryActionText: {
    color: '#4a9eff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#a0a0a0',
    marginTop: 4,
  },
  evaluateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4a9eff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  evaluateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  moduleCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
  },
  moduleSubtitle: {
    fontSize: 13,
    color: '#9dc7ff',
  },
  lessonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lessonTextGroup: {
    gap: 4,
    flex: 1,
  },
  lessonTitle: {
    color: '#f0f0f0',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  lessonDuration: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  emptySectionText: {
    color: '#c0c0c0',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    color: '#fff',
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    color: '#d0d0d0',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default DetalhesCursoScreen;
