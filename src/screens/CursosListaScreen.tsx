import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Course, RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const placeholderCourseImage = require('../assets/images/cursos/desenvolvimento-web.jpg');

type FilterOption = {
  key: string;
  label: string;
};

const CursosListaScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated } = useAuth();
  const {
    courses,
    enrollments,
    isLoadingCourses,
    isRefreshingCourses,
    coursesError,
    refreshCourses,
    refreshEnrollments,
  } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useFocusEffect(
    useCallback(() => {
      refreshCourses();
      if (isAuthenticated) {
        refreshEnrollments();
      }
    }, [refreshCourses, refreshEnrollments, isAuthenticated]),
  );

  const handleRefresh = useCallback(() => {
    refreshCourses(true);
    if (isAuthenticated) {
      refreshEnrollments(true);
    }
  }, [isAuthenticated, refreshCourses, refreshEnrollments]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((item) => item.curso.id));
  }, [enrollments]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => {
      if (course.categoria) {
        unique.add(course.categoria);
      }
    });
    return Array.from(unique).sort();
  }, [courses]);

  const filterOptions = useMemo<FilterOption[]>(() => {
    const base: FilterOption[] = [
      { key: 'all', label: 'Todos' },
      { key: 'enrolled', label: 'Inscritos' },
    ];

    const categoryOptions = categories.map<FilterOption>((categoria) => ({
      key: `category:${categoria}`,
      label: categoria,
    }));

    return [...base, ...categoryOptions];
  }, [categories]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        course.nomeCurso.toLowerCase().includes(normalizedQuery) ||
        (course.descricaoCurta || '').toLowerCase().includes(normalizedQuery) ||
        course.professor.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch) {
        return false;
      }

      if (selectedFilter === 'enrolled') {
        return enrolledCourseIds.has(course.id);
      }

      if (selectedFilter.startsWith('category:')) {
        const category = selectedFilter.replace('category:', '');
        return course.categoria === category;
      }

      return true;
    });
  }, [courses, enrolledCourseIds, searchQuery, selectedFilter]);

  const renderCourseCard = useCallback(
    ({ item }: { item: Course }) => {
      const enrolled = enrolledCourseIds.has(item.id);

      return (
        <TouchableOpacity
          style={styles.courseCard}
        onPress={() =>
          navigation.navigate('DetalhesCurso', { courseId: String(item.id) })
        }
      >
        <View style={styles.courseImageContainer}>
          <Image
            source={
              item.imagemCurso ? { uri: item.imagemCurso } : placeholderCourseImage
            }
            style={styles.courseImage}
            resizeMode="cover"
          />
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{item.categoria || 'Curso'}</Text>
          </View>
          {enrolled ? (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            </View>
          ) : null}
        </View>

        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.nomeCurso}
          </Text>
          <Text style={styles.courseInstructor} numberOfLines={1}>
            Por {item.professor}
          </Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {item.descricaoCurta || 'Descrição indisponível.'}
          </Text>

          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.metaText}>
                {item.tempoCurso ? `${item.tempoCurso}h` : 'Carga horária não informada'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.metaText}>
                {item.avaliacao ? item.avaliacao.toFixed(1) : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.courseFooter}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                enrolled ? styles.enrolledButton : styles.enrollButton,
              ]}
              onPress={() =>
                navigation.navigate('DetalhesCurso', { courseId: String(item.id) })
              }
            >
              <Text
                style={[
                  styles.actionButtonText,
                  enrolled ? styles.enrolledButtonText : styles.enrollButtonText,
                ]}
              >
                {enrolled ? 'Continuar' : 'Ver detalhes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
    },
    [enrolledCourseIds, navigation],
  );

  const renderFilterButton = ({ key, label }: FilterOption) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.filterButton,
        selectedFilter === key && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === key && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderListHeader = () => {
    return (
      <View style={styles.listHeader}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cursos, instrutores ou categorias..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map(renderFilterButton)}
          </ScrollView>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.resultsText}>
            {filteredCourses.length} curso
            {filteredCourses.length === 1 ? '' : 's'} encontrado
            {filteredCourses.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (coursesError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorTitle}>Não foi possível carregar os cursos</Text>
          <Text style={styles.errorMessage}>{coursesError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (courses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>Nenhum curso disponível no momento</Text>
          <Text style={styles.emptySubtitle}>
            Assim que novos cursos estiverem disponíveis, eles aparecerão aqui.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Nenhum curso encontrado</Text>
        <Text style={styles.emptySubtitle}>
          Ajuste os filtros ou o termo de busca para encontrar o curso ideal.
        </Text>
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedFilter('all');
          }}
        >
          <Text style={styles.clearFiltersButtonText}>Limpar filtros</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const showInitialLoading = isLoadingCourses && courses.length === 0;

  return (
    <View style={styles.container}>
      <Header showBackButton title="Cursos" />
      {showInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando cursos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingCourses}
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={['#4a9eff']}
            />
          }
        />
      )}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  listHeader: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersSection: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#d0d0d0',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsSection: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#c0c0c0',
  },
  courseCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  courseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  enrolledBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 6,
    borderRadius: 16,
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#9dc7ff',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 13,
    color: '#d0d0d0',
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
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#c0c0c0',
  },
  courseFooter: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollButton: {
    backgroundColor: '#4a9eff',
  },
  enrolledButton: {
    backgroundColor: '#2ecc71',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  enrollButtonText: {
    color: '#fff',
  },
  enrolledButtonText: {
    color: '#fff',
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    color: '#d0d0d0',
    textAlign: 'center',
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
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#d0d0d0',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  clearFiltersButton: {
    borderWidth: 1,
    borderColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  clearFiltersButtonText: {
    color: '#4a9eff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CursosListaScreen;
