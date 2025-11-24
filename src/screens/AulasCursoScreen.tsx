import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import {
  CourseDetails,
  Enrollment,
  Lesson,
  Module,
  RootStackParamList,
} from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import { CourseCache } from '../services/CourseCache';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AulasCurso'>;

type ProgressInfo = {
  progresso: number;
  aulasConcluidas: number;
  totalAulas: number;
};

const AulasCursoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { courseId } = route.params;
  const { isAuthenticated } = useAuth();
  const { enrollments, refreshEnrollments } = useCourses();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentLessonTitle, setCurrentLessonTitle] = useState('');
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(false);
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const [youtubeFallbackUrl, setYoutubeFallbackUrl] = useState<string | null>(null);
  const [cachedModules, setCachedModules] = useState<Module[]>([]);
  const [cachedCourse, setCachedCourse] = useState<CourseDetails | null>(null);
  const hasLoadedOnce = useRef(false);
  const [lastCourseId, setLastCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadData();
  }, [courseId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const activeEnrollment =
      enrollments.find(
        (item) => item.curso.id === Number(courseId) && item.status === 'ativo',
      ) || null;

    if (!activeEnrollment) {
      setEnrollment(null);
      setCompletedLessons(new Set());
      return;
    }

    setEnrollment(activeEnrollment);
    setCompletedLessons(
      new Set(
        activeEnrollment.progressoAulas
          .filter((progress) => progress.concluida)
          .map((progress) => progress.aula.id),
      ),
    );
  }, [courseId, enrollments, isAuthenticated]);

  const loadData = async () => {
    try {
      const isSameCourse = lastCourseId === String(courseId);
      const cached = CourseCache.get(Number(courseId));
      const hasCache = cached || cachedCourse || cachedModules.length > 0;
      const hasCurrentData = isSameCourse && (course || modules.length > 0);

      // Sempre tenta usar cache imediatamente para evitar flicker.
      if (cached?.course) {
        setCourse((prev) => prev || cached.course);
      }
      if (cached?.modules?.length) {
        setModules((prev) => (prev.length > 0 ? prev : cached.modules || []));
      }
      if (!cached && (cachedCourse || cachedModules.length > 0)) {
        setCourse((prev) => prev || cachedCourse);
        setModules((prev) => (prev.length > 0 ? prev : cachedModules));
      }

      const shouldShowSpinner = !hasCurrentData && !hasCache;
      if (shouldShowSpinner) {
        setIsLoading(true);
      }

      const [courseResponse, modulesResponse, enrollmentsResponse] = await Promise.all([
        ApiService.obterCurso(Number(courseId)),
        ApiService.listarModulosEAulasDoCurso(Number(courseId)),
        refreshEnrollments(false),
      ]);

      setCourse(courseResponse);
      setCachedCourse(courseResponse);
      setModules(modulesResponse);
      setCachedModules(modulesResponse);
      CourseCache.set(Number(courseId), { course: courseResponse, modules: modulesResponse });
      setLastCourseId(String(courseId));

      const activeEnrollment =
        enrollmentsResponse.find(
          (item) => item.curso.id === Number(courseId) && item.status === 'ativo',
        ) || null;

      if (!activeEnrollment) {
        Alert.alert(
          'Acesso restrito',
          'Você precisa estar inscrito neste curso para acessar as aulas.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
        return;
      }

      setEnrollment(activeEnrollment);

      const completed = new Set<number>(
        activeEnrollment.progressoAulas
          .filter((progress) => progress.concluida)
          .map((progress) => progress.aula.id),
      );
      setCompletedLessons(completed);

      const needsProgress =
        !progressInfo || !isSameCourse || progressInfo?.progresso === undefined;
      let progressResponseLocal = progressInfo;
      if (needsProgress) {
        progressResponseLocal = await ApiService.obterProgresso(activeEnrollment.id);
        setProgressInfo(progressResponseLocal);
      } else {
        ApiService.obterProgresso(activeEnrollment.id)
          .then((progressResponse) => setProgressInfo(progressResponse))
          .catch((progressError) => {
            console.warn('Falha ao obter progresso do curso', progressError);
          });
      }

      const firstIncompleteLesson = findFirstIncompleteLesson(modulesResponse, completed);
      setCurrentLessonId(firstIncompleteLesson ?? modulesResponse[0]?.aulas[0]?.id ?? null);
      hasLoadedOnce.current = true;
      setIsLoading(false);

      const totalLessonsLocal = modulesResponse.reduce(
        (total, module) => total + module.aulas.length,
        0,
      );
      const progressPercentLocal =
        progressResponseLocal?.progresso ??
        (totalLessonsLocal === 0 ? 0 : (completed.size / totalLessonsLocal) * 100);
      if (progressPercentLocal >= 100) {
        await verifyCertificateAvailability(activeEnrollment.id);
      } else {
        setCertificateAvailable(false);
      }

      CourseCache.set(Number(courseId), { course: courseResponse, modules: modulesResponse });
    } catch (error: any) {
      console.error('Erro ao carregar aulas do curso:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar as aulas deste curso.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      setIsLoading(false);
    }
  };

  const findFirstIncompleteLesson = (modulesList: Module[], completed: Set<number>) => {
    for (const module of modulesList) {
      for (const lesson of module.aulas) {
        if (!completed.has(lesson.id)) {
          return lesson.id;
        }
      }
    }
    return null;
  };

  const buildPlayableVideoUrl = (
    rawUrl: string | null | undefined,
  ): { playableUrl: string | null; fallbackWatchUrl: string | null } => {
    if (!rawUrl) {
      return { playableUrl: null, fallbackWatchUrl: null };
    }

    const trimmedUrl = rawUrl.trim();

    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
      let urlObj: URL | null = null;
      try {
        urlObj = new URL(trimmedUrl);
      } catch (error) {
        console.warn('URL inválida fornecida para o vídeo:', trimmedUrl);
      }

      let videoId = '';
      const originalParams = urlObj ? new URLSearchParams(urlObj.search) : null;

      if (trimmedUrl.includes('youtu.be')) {
        videoId = urlObj?.pathname.replace('/', '') ?? '';
      } else if (urlObj?.searchParams.get('v')) {
        videoId = urlObj?.searchParams.get('v') ?? '';
      } else if (urlObj?.pathname?.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0] ?? '';
      }

      if (videoId.length > 0) {
        const paramsToKeep = ['si', 'list', 'index', 'start', 'end'];
        const watchParams = new URLSearchParams();
        const embedParams = new URLSearchParams();

        paramsToKeep.forEach((key) => {
          const value = originalParams?.get(key);
          if (value) {
            embedParams.set(key, value);
            watchParams.set(key, value);
          }
        });

        embedParams.set('autoplay', '1');
        embedParams.set('modestbranding', '1');
        embedParams.set('playsinline', '1');
        embedParams.set('rel', '0');

        const embedQuery = embedParams.toString();
        const watchQuery = watchParams.toString();

        const watchUrl = watchQuery
          ? `https://www.youtube.com/watch?v=${videoId}&${watchQuery}`
          : `https://www.youtube.com/watch?v=${videoId}`;
        const embedUrl = embedQuery
          ? `https://www.youtube.com/embed/${videoId}?${embedQuery}`
          : `https://www.youtube.com/embed/${videoId}`;

        // Prefer the watch URL inside o WebView. Alguns vídeos bloqueiam incorporação (erro 153),
        // mas a página normal do YouTube continua reproduzindo dentro do WebView.
        return { playableUrl: watchUrl, fallbackWatchUrl: embedUrl };
      }
    }

    return { playableUrl: trimmedUrl, fallbackWatchUrl: null };
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setCurrentLessonId(lesson.id);

    if (!lesson.videoUrl) {
      NotificationService.showInfo('Esta aula ainda não possui vídeo disponível.');
      return;
    }

    const { playableUrl, fallbackWatchUrl } = buildPlayableVideoUrl(lesson.videoUrl);

    if (!playableUrl) {
      NotificationService.showError('Não conseguimos identificar o vídeo desta aula.');
      return;
    }

    setCurrentLessonTitle(lesson.nomeAula);
    setIsVideoLoading(true);
    setVideoUrl(playableUrl);
    setYoutubeFallbackUrl(fallbackWatchUrl);
    setIsVideoModalVisible(true);
  };

  const handleViewCertificate = async () => {
    if (!enrollment) {
      return;
    }

    try {
      setIsDownloadingCertificate(true);
      const safeCourseName = course?.nomeCurso
        ? course.nomeCurso.replace(/\s+/g, '_').toLowerCase()
        : `curso_${enrollment.id}`;
      const fileUri = await ApiService.baixarCertificado(
        enrollment.id,
        `certificado_${safeCourseName}`,
      );

      if (!fileUri) {
        throw new Error('Não foi possível gerar o certificado agora.');
      }

      const isShareAvailable = await Sharing.isAvailableAsync();
      if (isShareAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Certificado do curso',
        });
      } else {
        NotificationService.showSuccess('Certificado salvo nos seus arquivos.');
      }
      setCertificateAvailable(true);
    } catch (error: any) {
      console.error('Erro ao abrir certificado:', error);
      NotificationService.showError(
        error?.message || 'Não foi possível abrir o certificado agora.',
      );
    } finally {
      setIsDownloadingCertificate(false);
    }
  };

  const handleCompleteLesson = async (lesson: Lesson) => {
    if (!enrollment) {
      return;
    }

    try {
      await ApiService.concluirAula(enrollment.id, lesson.id);
      NotificationService.showSuccess('Aula marcada como concluída!');
      await refreshProgress();
    } catch (error: any) {
      console.error('Erro ao concluir aula:', error);
      NotificationService.showError(
        error?.message || 'Não foi possível marcar a aula como concluída.',
      );
    }
  };

  const handleUncompleteLesson = async (lesson: Lesson) => {
    if (!enrollment) {
      return;
    }

    try {
      await ApiService.desmarcarAula(enrollment.id, lesson.id);
      NotificationService.showInfo('Aula desmarcada com sucesso.');
      await refreshProgress();
    } catch (error: any) {
      console.error('Erro ao desmarcar aula:', error);
      NotificationService.showError(
        error?.message || 'Não foi possível desmarcar esta aula.',
      );
    }
  };

  const refreshProgress = async () => {
    if (!enrollment) {
      return;
    }

    const [progressResponse, enrollmentResponse] = await Promise.all([
      ApiService.obterProgresso(enrollment.id),
      refreshEnrollments(true),
    ]);

    const updatedEnrollment =
      enrollmentResponse.find(
        (item) => item.curso.id === Number(courseId) && item.status === 'ativo',
      ) || enrollment;

    setEnrollment(updatedEnrollment);
    setProgressInfo(progressResponse);
    setCompletedLessons(
      new Set(
        updatedEnrollment.progressoAulas
          .filter((progress) => progress.concluida)
          .map((progress) => progress.aula.id),
      ),
    );
    await verifyCertificateAvailability(updatedEnrollment.id);
  };

  const verifyCertificateAvailability = async (enrollmentId: number) => {
    try {
      setIsCheckingCertificate(true);
      const available = await ApiService.verificarCertificado(enrollmentId);
      setCertificateAvailable(available);
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      setCertificateAvailable(false);
    } finally {
      setIsCheckingCertificate(false);
    }
  };

  const totalLessons = useMemo(() => {
    return modules.reduce((total, module) => total + module.aulas.length, 0);
  }, [modules]);

  const completedCount = completedLessons.size;
  const progressPercentage = progressInfo?.progresso ?? (totalLessons === 0 ? 0 : (completedCount / totalLessons) * 100);
  const isCertificateUnlocked = progressPercentage >= 100;

  if (!isAuthenticated) {
    return (
      <View style={styles.restrictedContainer}>
        <Header showBackButton title="Aulas do curso" />
        <View style={styles.restrictedContent}>
          <Ionicons name="lock-closed" size={48} color="#4a9eff" />
          <Text style={styles.restrictedTitle}>Acesso restrito</Text>
          <Text style={styles.restrictedMessage}>
            Faça login para acessar as aulas dos seus cursos.
          </Text>
          <TouchableOpacity
            style={styles.restrictedButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.restrictedButtonText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  if (isLoading || !course) {
    return (
      <View style={styles.loadingWrapper}>
        <Header showBackButton title="Aulas do curso" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando aulas...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (!enrollment) {
    return (
      <View style={styles.restrictedContainer}>
        <Header showBackButton title="Aulas do curso" />
        <View style={styles.restrictedContent}>
          <Ionicons name="alert-circle" size={48} color="#e67e22" />
          <Text style={styles.restrictedTitle}>Inscrição necessária</Text>
          <Text style={styles.restrictedMessage}>
            Você precisa estar inscrito neste curso para acessar as aulas.
          </Text>
          <TouchableOpacity
            style={styles.restrictedButton}
            onPress={() => navigation.navigate('DetalhesCurso', { courseId })}
          >
            <Text style={styles.restrictedButtonText}>Ir para detalhes do curso</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Aulas do curso" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.nomeCurso}</Text>
            <Text style={styles.courseInstructor}>Instrutor: {course.professor}</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Progresso do curso</Text>
                <Text style={styles.progressSubtitle}>
                  {completedCount} de {totalLessons} aulas concluídas
                </Text>
              </View>
              <Text style={styles.progressPercentageLabel}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <View style={styles.progressStat}>
              <Ionicons name="time" size={18} color="#4a9eff" />
              <Text style={styles.progressStatLabel}>
                {course.tempoCurso ? `${course.tempoCurso}h de conteúdo` : 'Carga horária não informada'}
              </Text>
            </View>
            <View style={styles.progressStat}>
              <Ionicons name="trophy" size={18} color="#f1c40f" />
              <Text style={styles.progressStatLabel}>
                {Math.round(progressPercentage)}% concluído
              </Text>
            </View>
          </View>
        </View>

          {isCertificateUnlocked && (
            <View style={styles.certificateCallout}>
              <View style={styles.certificateCalloutHeader}>
                <View style={styles.certificateIconWrapper}>
                  <Ionicons name="school-outline" size={22} color="#fff" />
                </View>
                <View style={styles.certificateTextGroup}>
                  <Text style={styles.certificateCalloutTitle}>Certificado disponível</Text>
                  <Text style={styles.certificateCalloutSubtitle}>
                    {certificateAvailable
                      ? 'Parabéns! Seu certificado está pronto.'
                      : isCheckingCertificate
                        ? 'Verificando disponibilidade do certificado...'
                        : 'Toque para emitir e fazer o download do certificado.'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.certificateButton,
                  (isDownloadingCertificate || isCheckingCertificate) && styles.buttonDisabled,
                ]}
                onPress={handleViewCertificate}
                disabled={isDownloadingCertificate || isCheckingCertificate}
              >
                {isDownloadingCertificate ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="document-text" size={18} color="#fff" />
                    <Text style={styles.certificateButtonText}>Ver certificado</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.modulesSection}>
            {modules.map((module) => {
              const completedInModule = module.aulas.filter((lesson) =>
                completedLessons.has(lesson.id),
              ).length;
              return (
                <View key={module.id} style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <View>
                      <Text style={styles.moduleTitle}>{module.nomeModulo}</Text>
                      <Text style={styles.moduleSubtitle}>
                        {module.aulas.length} aula
                        {module.aulas.length === 1 ? '' : 's'} •{' '}
                        {completedInModule} concluída
                        {completedInModule === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>
                  {module.aulas.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const disableUncomplete = isCertificateUnlocked;
                    const isCurrent = currentLessonId === lesson.id;

                    return (
                      <View
                        key={lesson.id}
                        style={[
                          styles.lessonCard,
                          isCurrent && styles.lessonCardActive,
                          isCompleted && styles.lessonCardCompleted,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.lessonInfo}
                          onPress={() => handleOpenLesson(lesson)}
                        >
                          <Ionicons
                            name={
                              isCompleted ? 'checkmark-circle' : 'play-circle-outline'
                            }
                            size={24}
                            color={isCompleted ? '#2ecc71' : '#4a9eff'}
                          />
                          <View style={styles.lessonTextGroup}>
                            <Text
                              style={[
                                styles.lessonTitle,
                                isCompleted && styles.lessonTitleCompleted,
                              ]}
                            >
                              {lesson.nomeAula}
                            </Text>
                            <Text style={styles.lessonSubtitle}>
                              {lesson.tempoAula
                                ? `${lesson.tempoAula} minuto${
                                    lesson.tempoAula === 1 ? '' : 's'
                                  }`
                                : 'Duração não informada'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.lessonActions}>
                          {isCompleted && !disableUncomplete ? (
                            <TouchableOpacity
                              style={[styles.markButton, styles.markButtonOutlined]}
                              onPress={() => handleUncompleteLesson(lesson)}
                            >
                              <Ionicons name="close" size={16} color="#e74c3c" />
                              <Text style={styles.markButtonOutlinedText}>Desfazer</Text>
                            </TouchableOpacity>
                          ) : !isCompleted ? (
                            <TouchableOpacity
                              style={styles.markButton}
                              onPress={() => handleCompleteLesson(lesson)}
                            >
                              <Ionicons name="checkmark" size={16} color="#fff" />
                              <Text style={styles.markButtonText}>Concluir</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <Footer />

      <Modal
        visible={isVideoModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setIsVideoModalVisible(false);
          setVideoUrl(null);
          setYoutubeFallbackUrl(null);
        }}
        transparent
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>{currentLessonTitle}</Text>
              <TouchableOpacity
                style={styles.videoModalCloseButton}
                onPress={() => {
                  setIsVideoModalVisible(false);
                  setVideoUrl(null);
                  setYoutubeFallbackUrl(null);
                  setIsVideoLoading(false);
                }}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.videoModalBody}>
              {isVideoLoading && (
                <View style={styles.videoLoadingContainer}>
                  <ActivityIndicator size="large" color="#4a9eff" />
                  <Text style={styles.videoLoadingText}>Carregando vídeo...</Text>
                </View>
              )}
              {videoUrl && (
                <WebView
                  source={{ uri: videoUrl }}
                  onLoadStart={() => setIsVideoLoading(true)}
                  onLoadEnd={() => setIsVideoLoading(false)}
                  onError={() => {
                    if (youtubeFallbackUrl) {
                      setIsVideoModalVisible(false);
                      setVideoUrl(null);
                      setYoutubeFallbackUrl(null);
                      setIsVideoLoading(false);

                      Linking.openURL(youtubeFallbackUrl).catch(() => {
                        NotificationService.showError(
                          'Não foi possível carregar o vídeo no player integrado. Abrir no YouTube também falhou.',
                        );
                      });
                      return;
                    }
                    setIsVideoModalVisible(false);
                    setVideoUrl(null);
                    setYoutubeFallbackUrl(null);
                    NotificationService.showError(
                      'Não foi possível carregar o vídeo desta aula.',
                    );
                  }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                  style={styles.videoWebView}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
  },
  restrictedContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  restrictedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  restrictedMessage: {
    fontSize: 14,
    color: '#c0c0c0',
    textAlign: 'center',
    lineHeight: 20,
  },
  restrictedButton: {
    marginTop: 10,
    backgroundColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  restrictedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  courseHeader: {
    marginTop: 24,
    marginBottom: 20,
    gap: 6,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  courseInstructor: {
    fontSize: 14,
    color: '#9dc7ff',
  },
  progressCard: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#c0c0c0',
  },
  progressPercentageLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 8,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressStatLabel: {
    color: '#cfd9ff',
    fontSize: 13,
  },
  certificateCallout: {
    backgroundColor: '#142239',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f3352',
    padding: 18,
    marginBottom: 24,
    gap: 14,
  },
  certificateCalloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  certificateIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#254473',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateTextGroup: {
    flex: 1,
    gap: 6,
  },
  certificateCalloutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  certificateCalloutSubtitle: {
    color: '#cfd9ff',
    fontSize: 13,
    lineHeight: 18,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  certificateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  modulesSection: {
    gap: 18,
  },
  moduleCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    overflow: 'hidden',
  },
  moduleHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b2b',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 13,
    color: '#c0c0c0',
  },
  lessonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b2b',
  },
  lessonCardActive: {
    backgroundColor: '#1b2a38',
  },
  lessonCardCompleted: {
    backgroundColor: '#152418',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lessonTextGroup: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  lessonTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9be7b0',
  },
  lessonSubtitle: {
    fontSize: 12,
    color: '#c0c0c0',
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 10,
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  markButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  markButtonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  markButtonOutlinedText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '600',
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  videoModalContent: {
    backgroundColor: '#000',
    borderRadius: 18,
    overflow: 'hidden',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1f1f1f',
  },
  videoModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  videoModalCloseButton: {
    padding: 4,
  },
  videoModalBody: {
    width: width - 32,
    height: ((width - 32) * 9) / 16,
    backgroundColor: '#000',
  },
  videoWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
  },
  videoLoadingText: {
    marginTop: 10,
    color: '#fff',
  },
});

export default AulasCursoScreen;
