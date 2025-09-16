import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CourseDetails } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AulasCurso'>;

const AulasCursoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { courseId } = route.params;
  
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  // Mock data - em produção viria da API baseado no courseId
  const course: CourseDetails = {
    id: courseId,
    title: 'Fundamentos em Python',
    nomeCurso: 'Fundamentos em Python',
    description: 'Aprenda os conceitos básicos da linguagem Python e suas aplicações.',
    descricaoDetalhada: 'Este curso abrange desde os conceitos básicos até tópicos intermediários da linguagem Python.',
    image: require('../assets/images/cursos/python.png'),
    instructor: 'Dilermando Piva',
    instructorImage: require('../assets/images/perfil.png'),
    duration: '10h',
    tempoCurso: 10,
    modules: 8,
    level: 'Iniciante',
    rating: 4.8,
    avaliacao: 4.8,
    enrolled: true,
    modulos: [
      {
        nomeModulo: 'Introdução ao Python',
        aulas: [
          { nomeAula: 'O que é Python?', duracao: '15 min', concluida: false },
          { nomeAula: 'Instalação e Configuração', duracao: '20 min', concluida: false },
          { nomeAula: 'Primeiro Programa', duracao: '10 min', concluida: false },
        ],
      },
      {
        nomeModulo: 'Variáveis e Tipos de Dados',
        aulas: [
          { nomeAula: 'Números e Strings', duracao: '25 min', concluida: false },
          { nomeAula: 'Listas e Tuplas', duracao: '30 min', concluida: false },
          { nomeAula: 'Dicionários', duracao: '25 min', concluida: false },
        ],
      },
      {
        nomeModulo: 'Estruturas de Controle',
        aulas: [
          { nomeAula: 'Condicionais (if/else)', duracao: '20 min', concluida: false },
          { nomeAula: 'Loops (for/while)', duracao: '30 min', concluida: false },
          { nomeAula: 'Exercícios Práticos', duracao: '40 min', concluida: false },
        ],
      },
    ],
  };

  const handleLessonPress = (moduleIndex: number, lessonIndex: number) => {
    const globalLessonIndex = getGlobalLessonIndex(moduleIndex, lessonIndex);
    setCurrentLesson(globalLessonIndex);
    // Aqui você abriria o player de vídeo ou conteúdo da aula
    Alert.alert(
      'Aula Selecionada',
      `Iniciando: ${course.modulos[moduleIndex].aulas[lessonIndex].nomeAula}`,
      [{ text: 'OK' }]
    );
  };

  const handleCompleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const globalLessonIndex = getGlobalLessonIndex(moduleIndex, lessonIndex);
    const newCompleted = new Set(completedLessons);
    newCompleted.add(globalLessonIndex);
    setCompletedLessons(newCompleted);
    
    Alert.alert('Parabéns!', 'Aula concluída com sucesso!');
  };

  const getGlobalLessonIndex = (moduleIndex: number, lessonIndex: number) => {
    let globalIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
      globalIndex += course.modulos[i].aulas.length;
    }
    return globalIndex + lessonIndex;
  };

  const getTotalLessons = () => {
    return course.modulos.reduce((total, modulo) => total + modulo.aulas.length, 0);
  };

  const getCompletedCount = () => {
    return completedLessons.size;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessons();
    const completed = getCompletedCount();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const renderModule = (modulo: any, moduleIndex: number) => (
    <View key={moduleIndex} style={styles.module}>
      <View style={styles.moduleHeader}>
        <Text style={styles.moduleTitle}>{modulo.nomeModulo}</Text>
        <Text style={styles.moduleProgress}>
          {modulo.aulas.filter((aula: any, index: number) => 
            completedLessons.has(getGlobalLessonIndex(moduleIndex, index))
          ).length} / {modulo.aulas.length} aulas
        </Text>
      </View>
      
      <View style={styles.lessonsList}>
        {modulo.aulas.map((aula: any, lessonIndex: number) => {
          const globalIndex = getGlobalLessonIndex(moduleIndex, lessonIndex);
          const isCompleted = completedLessons.has(globalIndex);
          const isCurrent = globalIndex === currentLesson;
          
          return (
            <TouchableOpacity
              key={lessonIndex}
              style={[
                styles.lesson,
                isCurrent && styles.currentLesson,
                isCompleted && styles.completedLesson
              ]}
              onPress={() => handleLessonPress(moduleIndex, lessonIndex)}
            >
              <View style={styles.lessonInfo}>
                <View style={styles.lessonIcon}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  ) : (
                    <Ionicons name="play-circle" size={20} color="#125887" />
                  )}
                </View>
                <View style={styles.lessonContent}>
                  <Text style={[
                    styles.lessonName,
                    isCompleted && styles.completedText
                  ]}>
                    {aula.nomeAula}
                  </Text>
                  <Text style={styles.lessonDuration}>{aula.duracao}</Text>
                </View>
              </View>
              
              {!isCompleted && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteLesson(moduleIndex, lessonIndex)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header showBackButton title="Aulas do Curso" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Course Header */}
          <View style={styles.courseHeader}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.nomeCurso}</Text>
              <Text style={styles.courseInstructor}>Por {course.instructor}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progresso do Curso</Text>
              <Text style={styles.progressText}>
                {getCompletedCount()} de {getTotalLessons()} aulas concluídas
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}% concluído
            </Text>
          </View>

          {/* Course Curriculum */}
          <View style={styles.curriculumSection}>
            <Text style={styles.sectionTitle}>Conteúdo do Curso</Text>
            {course.modulos.map(renderModule)}
          </View>

          {/* Course Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#125887" />
              <Text style={styles.statValue}>{course.tempoCurso}h</Text>
              <Text style={styles.statLabel}>Duração Total</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="layers" size={24} color="#125887" />
              <Text style={styles.statValue}>{course.modulos.length}</Text>
              <Text style={styles.statLabel}>Módulos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="play" size={24} color="#125887" />
              <Text style={styles.statValue}>{getTotalLessons()}</Text>
              <Text style={styles.statLabel}>Aulas</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                // Lógica para continuar de onde parou
                Alert.alert('Continuar', 'Continuando de onde você parou...');
              }}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.continueButtonText}>Continuar Assistindo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.certificateButton}
              onPress={() => {
                if (getProgressPercentage() === 100) {
                  navigation.navigate('Certificados');
                } else {
                  Alert.alert(
                    'Certificado',
                    'Complete todas as aulas para receber seu certificado!'
                  );
                }
              }}
            >
              <Ionicons name="school" size={20} color="#125887" />
              <Text style={styles.certificateButtonText}>Ver Certificado</Text>
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
  courseHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a9eff',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
    textAlign: 'center',
  },
  curriculumSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 20,
  },
  module: {
    marginBottom: 25,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a9eff',
  },
  moduleProgress: {
    fontSize: 12,
    color: '#666',
  },
  lessonsList: {
    gap: 8,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentLesson: {
    backgroundColor: '#e3f2fd',
    borderColor: '#125887',
  },
  completedLesson: {
    backgroundColor: '#f0f8f0',
    borderColor: '#2ecc71',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonIcon: {
    marginRight: 15,
  },
  lessonContent: {
    flex: 1,
  },
  lessonName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  completedText: {
    color: '#2ecc71',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#2ecc71',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginTop: 5,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionSection: {
    gap: 15,
    marginBottom: 30,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#125887',
  },
  certificateButtonText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AulasCursoScreen;
