import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Course } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CursosListaScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - em produção viria da API
  const allCourses: Course[] = [
    {
      id: '1',
      title: 'Fundamentos em Python',
      description: 'Aprenda os conceitos básicos da linguagem Python e suas aplicações.',
      image: require('../assets/images/cursos/python.png'),
      instructor: 'Dilermando Piva',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '10h',
      modules: 8,
      level: 'Iniciante',
      rating: 4.8,
      enrolled: false,
    },
    {
      id: '2',
      title: 'React Native Para Mobile',
      description: 'Desenvolva aplicativos móveis para iOS e Android com React Native.',
      image: require('../assets/images/cursos/desenvolvimento-apps.jpg'),
      instructor: 'Marcos Andrade',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '50h',
      modules: 5,
      level: 'Intermediário',
      rating: 4.9,
      enrolled: true,
    },
    {
      id: '3',
      title: 'JavaScript Avançado',
      description: 'Domine conceitos avançados de JavaScript e desenvolvimento web moderno.',
      image: require('../assets/images/cursos/desenvolvimento-web.jpg'),
      instructor: 'Camila Oliveira',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '55h',
      modules: 5,
      level: 'Avançado',
      rating: 4.7,
      enrolled: false,
    },
    {
      id: '4',
      title: 'Desenvolvimento Web Full Stack',
      description: 'Aprenda a criar aplicações web completas com frontend e backend.',
      image: require('../assets/images/cursos/desenvolvimento-web.jpg'),
      instructor: 'Ana Santos',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '80h',
      modules: 12,
      level: 'Intermediário',
      rating: 4.6,
      enrolled: false,
    },
    {
      id: '5',
      title: 'Data Science com Python',
      description: 'Análise de dados, machine learning e visualização com Python.',
      image: require('../assets/images/cursos/python.png'),
      instructor: 'Carlos Silva',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '60h',
      modules: 10,
      level: 'Avançado',
      rating: 4.9,
      enrolled: false,
    },
    {
      id: '6',
      title: 'UI/UX Design',
      description: 'Aprenda design de interfaces e experiência do usuário.',
      image: require('../assets/images/cursos/desenvolvimento-apps.jpg'),
      instructor: 'Maria Costa',
      instructorImage: require('../assets/images/perfil.png'),
      duration: '40h',
      modules: 6,
      level: 'Iniciante',
      rating: 4.5,
      enrolled: false,
    },
  ];

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'beginner', label: 'Iniciante' },
    { key: 'intermediate', label: 'Intermediário' },
    { key: 'advanced', label: 'Avançado' },
    { key: 'free', label: 'Gratuitos' },
    { key: 'enrolled', label: 'Inscritos' },
  ];

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'beginner':
        return course.level === 'Iniciante';
      case 'intermediate':
        return course.level === 'Intermediário';
      case 'advanced':
        return course.level === 'Avançado';
      case 'free':
        return true; // Todos os cursos são gratuitos
      case 'enrolled':
        return course.enrolled;
      default:
        return true;
    }
  });

  const renderCourseCard = ({ item: course }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('DetalhesCurso', { courseId: course.id })}
    >
      <View style={styles.courseImageContainer}>
        <Image source={course.image} style={styles.courseImage} />
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>{course.level}</Text>
        </View>
        {course.enrolled && (
          <View style={styles.enrolledBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
          </View>
        )}
      </View>
      
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.courseInstructor}>
          Por {course.instructor}
        </Text>
        
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="layers" size={14} color="#666" />
            <Text style={styles.metaText}>{course.modules} módulos</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <Text style={styles.metaText}>{course.rating}</Text>
          </View>
        </View>
        
        <View style={styles.courseFooter}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              course.enrolled ? styles.enrolledButton : styles.enrollButton
            ]}
            onPress={() => navigation.navigate('DetalhesCurso', { courseId: course.id })}
          >
            <Text style={[
              styles.actionButtonText,
              course.enrolled ? styles.enrolledButtonText : styles.enrollButtonText
            ]}>
              {course.enrolled ? 'Continuar' : 'Ver Detalhes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.key && styles.activeFilterButtonText
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header showBackButton title="Cursos" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScrollView}
            >
              {filters.map(renderFilterButton)}
            </ScrollView>
          </View>

          {/* Results Count */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Courses List */}
          <View style={styles.coursesSection}>
            {filteredCourses.length > 0 ? (
              <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.coursesList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>Nenhum curso encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Tente ajustar os filtros ou termo de busca
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                >
                  <Text style={styles.clearFiltersButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
              </View>
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
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filtersSection: {
    marginBottom: 20,
  },
  filtersScrollView: {
    paddingLeft: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  activeFilterButton: {
    backgroundColor: '#4a9eff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  coursesSection: {
    marginBottom: 30,
  },
  coursesList: {
    gap: 15,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 150,
  },
  courseBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  enrolledBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 5,
  },
  courseContent: {
    padding: 15,
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
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  enrollButton: {
    backgroundColor: '#4a9eff',
  },
  enrolledButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  enrollButtonText: {
    color: '#fff',
  },
  enrolledButtonText: {
    color: '#4a9eff',
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
  clearFiltersButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CursosListaScreen;
