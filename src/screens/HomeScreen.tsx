import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Course } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const featuredCourses: Course[] = [
    {
      id: '13',
      title: 'Fundamentos em Python',
      description: 'Estude os principais fundamentos da linguagem Python.',
      image: require('../assets/images/cursos/python.png'),
      instructor: 'Dilermando Piva',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '10h',
      modules: 8,
      level: 'Iniciante',
      rating: 4.8,
    },
    {
      id: '2',
      title: 'Introdução ao React Native Para Mobile',
      description: 'Crie aplicativos iOS e Android com React Native',
      image: require('../assets/images/cursos/desenvolvimento-apps.jpg'),
      instructor: 'Marcos Andrade',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '50h',
      modules: 5,
      level: 'Intermediário',
      rating: 4.9,
    },
    {
      id: '12',
      title: 'JavaScript Avançado para Web',
      description: 'Análise de dados, machine learning e visualização com Python',
      image: require('../assets/images/cursos/desenvolvimento-web.jpg'),
      instructor: 'Camila Oliveira',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '55h',
      modules: 5,
      level: 'Avançado',
      rating: 4.7,
    },
  ];

  const features = [
    {
      icon: 'infinite',
      title: 'Acesso Ilimitado',
      description: 'Estude no seu ritmo, quando e onde quiser',
    },
    {
      icon: 'school',
      title: 'Certificados Reconhecidos',
      description: 'Certificados válidos no mercado de trabalho',
    },
    {
      icon: 'people',
      title: 'Comunidade Ativa',
      description: 'Networking e suporte de outros alunos',
    },
    {
      icon: 'laptop',
      title: 'Conteúdo Atualizado',
      description: 'Tecnologias e práticas mais recentes do mercado',
    },
  ];

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() => navigation.navigate('DetalhesCurso', { courseId: course.id })}
    >
      <View style={styles.courseCardHeader}>
        <Image source={course.image} style={styles.courseImage} />
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>{course.level}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#ffc107" />
          <Text style={styles.ratingText}>{course.rating}</Text>
        </View>
      </View>
      <View style={styles.courseCardBody}>
        <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color="#666" />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="layers" size={12} color="#666" />
            <Text style={styles.metaText}>{course.modules}</Text>
          </View>
        </View>
        <View style={styles.instructorContainer}>
          <Image source={course.instructorImage} style={styles.instructorImage} />
          <Text style={styles.instructorName}>{course.instructor}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeatureCard = (feature: any, index: number) => (
    <View key={index} style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={feature.icon as any} size={24} color="#4a9eff" />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Transforme sua Carreira em Tecnologia</Text>
            <Text style={styles.heroSubtitle}>
              Aprenda programação com professores experientes e conteúdo atualizado.
            </Text>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>+1000</Text>
                <Text style={styles.metricLabel}>Alunos</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>50+</Text>
                <Text style={styles.metricLabel}>Cursos</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricNumber}>24/7</Text>
                <Text style={styles.metricLabel}>Suporte</Text>
              </View>
            </View>
            
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('CursosLista')}
              >
                <Text style={styles.ctaButtonText}>Ver Cursos</Text>
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

        {/* Featured Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos em Destaque</Text>
            <Text style={styles.sectionSubtitle}>
              Escolha o caminho certo para sua carreira
            </Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CursosLista')}
            >
              <Text style={styles.viewAllButtonText}>Ver Todos</Text>
              <Ionicons name="arrow-forward" size={16} color="#4a9eff" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coursesScrollView}
            contentContainerStyle={styles.coursesContainer}
          >
            {featuredCourses.map(renderCourseCard)}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por que Escolher Nossa Plataforma?</Text>
            <Text style={styles.sectionSubtitle}>
              Recursos que fazem a diferença na sua jornada de aprendizado
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map(renderFeatureCard)}
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 12,
    lineHeight: 30,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    width: '100%',
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
    fontSize: 11,
    color: '#c0c0c0',
    textAlign: 'center',
  },
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    maxWidth: 140,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4a9eff',
    flex: 1,
    maxWidth: 140,
  },
  secondaryButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
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
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  viewAllButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  coursesScrollView: {
    paddingLeft: 20,
  },
  coursesContainer: {
    paddingRight: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: width * 0.65,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  courseCardHeader: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  courseBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  courseBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  courseCardBody: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 8,
    lineHeight: 18,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 3,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  instructorImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  instructorName: {
    fontSize: 11,
    color: '#666666',
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: (width - 52) / 2,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default HomeScreen;
