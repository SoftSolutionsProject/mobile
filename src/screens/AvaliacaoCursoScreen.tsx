import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AvaliacaoCurso'>;

const AvaliacaoCursoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { courseId } = route.params;
  const { isAuthenticated, user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingAvaliacao, setExistingAvaliacao] = useState<any>(null);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, courseId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do curso
      const course = await ApiService.obterCurso(parseInt(courseId));
      setCourseName(course.nomeCurso);
      
      // Verificar se já existe avaliação
      try {
        const avaliacao = await ApiService.getMinhaAvaliacao(parseInt(courseId));
        setExistingAvaliacao(avaliacao);
        setRating(avaliacao.nota);
        setComment(avaliacao.comentario || '');
      } catch (error) {
        // Não existe avaliação ainda
        console.log('Nenhuma avaliação encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erro', 'Por favor, selecione uma nota para o curso');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Erro', 'Por favor, escreva um comentário sobre o curso');
      return;
    }

    try {
      setIsSaving(true);
      
      const avaliacaoData = {
        cursoId: parseInt(courseId),
        nota: rating,
        comentario: comment.trim(),
      };

      if (existingAvaliacao) {
        // Atualizar avaliação existente
        await ApiService.atualizarAvaliacao(existingAvaliacao.id, avaliacaoData);
        Alert.alert('Sucesso', 'Avaliação atualizada com sucesso!');
      } else {
        // Criar nova avaliação
        await ApiService.avaliarCurso(avaliacaoData);
        Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', error.message || 'Erro ao salvar avaliação');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleRatingPress(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#ffc107' : '#ddd'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Avaliar Curso" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Você precisa fazer login para avaliar cursos</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Avaliar Curso" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Avaliar Curso" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{courseName}</Text>
            <Text style={styles.courseSubtitle}>
              {existingAvaliacao ? 'Atualize sua avaliação' : 'Avalie este curso'}
            </Text>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Sua Avaliação</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Selecione uma nota' : 
               rating === 1 ? 'Péssimo' :
               rating === 2 ? 'Ruim' :
               rating === 3 ? 'Regular' :
               rating === 4 ? 'Bom' : 'Excelente'}
            </Text>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Comentário</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Conte sua experiência com este curso..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.commentHint}>
              Mínimo 10 caracteres
            </Text>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[styles.submitButton, isSaving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {existingAvaliacao ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

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
  courseInfo: {
    backgroundColor: '#4a9eff',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  courseSubtitle: {
    fontSize: 14,
    color: '#b0c4de',
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  commentSection: {
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
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
  },
  commentHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  submitSection: {
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#4a9eff',
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AvaliacaoCursoScreen;

