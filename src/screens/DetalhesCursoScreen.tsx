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
import { RootStackParamList, CourseDetails, Review } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'DetalhesCurso'>;

const DetalhesCursoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { courseId } = route.params;
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - em produção viria da API baseado no courseId
  const course: CourseDetails = {
    id: courseId,
    title: 'Fundamentos em Python',
    nomeCurso: 'Fundamentos em Python',
    description: 'Aprenda os conceitos básicos da linguagem Python e suas aplicações.',
    descricaoDetalhada: 'Este curso abrange desde os conceitos básicos até tópicos intermediários da linguagem Python. Você aprenderá sobre variáveis, estruturas de controle, funções, classes e muito mais. Ideal para iniciantes que desejam começar sua jornada na programação.',
    image: require('../assets/images/cursos/python.png'),
    instructor: 'Dilermando Piva',
    instructorImage: require('../assets/images/perfil.png'),
    duration: '10h',
    tempoCurso: 10,
    modules: 8,
    level: 'Iniciante',
    rating: 4.8,
    avaliacao: 4.8,
    enrolled: isEnrolled,
    modulos: [
      {
        nomeModulo: 'Introdução ao Python',
        aulas: [
          { nomeAula: 'O que é Python?', duracao: '15 min' },
          { nomeAula: 'Instalação e Configuração', duracao: '20 min' },
          { nomeAula: 'Primeiro Programa', duracao: '10 min' },
        ],
      },
      {
        nomeModulo: 'Variáveis e Tipos de Dados',
        aulas: [
          { nomeAula: 'Números e Strings', duracao: '25 min' },
          { nomeAula: 'Listas e Tuplas', duracao: '30 min' },
          { nomeAula: 'Dicionários', duracao: '25 min' },
        ],
      },
      {
        nomeModulo: 'Estruturas de Controle',
        aulas: [
          { nomeAula: 'Condicionais (if/else)', duracao: '20 min' },
          { nomeAula: 'Loops (for/while)', duracao: '30 min' },
          { nomeAula: 'Exercícios Práticos', duracao: '40 min' },
        ],
      },
    ],
  };

  const reviews: Review[] = [
    {
      autor: 'Maria Silva',
      nota: 5,
      comentario: 'Excelente curso! O professor explica muito bem e os exercícios são práticos.',
      data: '2024-01-10',
    },
    {
      autor: 'João Santos',
      nota: 4,
      comentario: 'Muito bom para iniciantes. Conteúdo bem estruturado e fácil de acompanhar.',
      data: '2024-01-15',
    },
    {
      autor: 'Ana Costa',
      nota: 5,
      comentario: 'Recomendo! Aprendi muito e já estou aplicando no meu trabalho.',
      data: '2024-01-20',
    },
  ];

  const handleEnroll = () => {
    setIsLoading(true);
    // Mock inscrição - em produção seria uma chamada à API
    setTimeout(() => {
      setIsEnrolled(true);
      setIsLoading(false);
      Alert.alert('Sucesso', 'Você foi inscrito no curso!', [
        { text: 'OK', onPress: () => navigation.navigate('AulasCurso', { courseId }) }
      ]);
    }, 1000);
  };

  const handleCancelEnrollment = () => {
    Alert.alert(
      'Cancelar Inscrição',
      'Tem certeza que deseja cancelar sua inscrição neste curso?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => setIsEnrolled(false) }
      ]
    );
  };

  const handleWatchCourse = () => {
    navigation.navigate('AulasCurso', { courseId });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#ffc107' : '#ccc'}
        />
      );
    }
    return stars;
  };

  const renderModule = (modulo: any, index: number) => (
    <View key={index} style={styles.module}>
      <Text style={styles.moduleTitle}>{modulo.nomeModulo}</Text>
      <View style={styles.lessonsList}>
        {modulo.aulas.map((aula: any, aulaIndex: number) => (
          <View key={aulaIndex} style={styles.lesson}>
            <Ionicons name="play-circle" size={16} color="#125887" />
            <Text style={styles.lessonName}>{aula.nomeAula}</Text>
            <Text style={styles.lessonDuration}>{aula.duracao}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderReview = (review: Review, index: number) => (
    <View key={index} style={styles.review}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{review.autor}</Text>
        <View style={styles.reviewRating}>
          {renderStars(review.nota)}
        </View>
      </View>
      <Text style={styles.reviewComment}>"{review.comentario}"</Text>
      <Text style={styles.reviewDate}>
        {new Date(review.data).toLocaleDateString('pt-BR')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header showBackButton title="Detalhes do Curso" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Course Header */}
          <View style={styles.courseHeader}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.nomeCurso}</Text>
              <Text style={styles.courseDescription}>{course.descricaoDetalhada}</Text>
              
              {/* Course Details */}
              <View style={styles.courseDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={20} color="#125887" />
                  <Text style={styles.detailText}>{course.tempoCurso} horas</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people" size={20} color="#125887" />
                  <Text style={styles.detailText}>1.250 inscritos</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={20} color="#125887" />
                  <Text style={styles.detailText}>Certificado de conclusão</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="star" size={20} color="#ffc107" />
                  <Text style={styles.detailText}>Avaliação média: {course.avaliacao}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {isEnrolled ? (
                  <View style={styles.enrolledButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelEnrollment}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar inscrição</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.watchButton}
                      onPress={handleWatchCourse}
                    >
                      <Text style={styles.watchButtonText}>Assistir curso</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={handleEnroll}
                    disabled={isLoading}
                  >
                    <Text style={styles.enrollButtonText}>
                      {isLoading ? 'Processando...' : 'Inscrever-se'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
          </View>

          {/* Course Curriculum */}
          <View style={styles.curriculumSection}>
            <Text style={styles.sectionTitle}>Ementa do Curso</Text>
            {course.modulos.map(renderModule)}
          </View>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Avaliações dos Alunos</Text>
              {reviews.map(renderReview)}
            </View>
          )}
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
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  courseDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  actionButtons: {
    marginTop: 20,
  },
  enrollButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enrolledButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  watchButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 10,
  },
  lessonsList: {
    paddingLeft: 10,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lessonName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#999',
  },
  reviewsSection: {
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
  review: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default DetalhesCursoScreen;
