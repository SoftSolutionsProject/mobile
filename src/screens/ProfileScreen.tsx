import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Enrollment, RootStackParamList, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';
import ProfileImageService from '../services/ProfileImageService';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Profile'>;

const INPUT_TEXT_COLOR = '#111827';
const PLACEHOLDER_COLOR = '#6b7280';

type EditProfileData = {
  nomeUsuario: string;
  email: string;
  cpfUsuario: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { userId } = route.params || { userId: '1' };
  const { isAuthenticated, user: authUser, updateUser } = useAuth();
  const { enrollments, refreshEnrollments } = useCourses();
  const resolvedUserId = authUser?.id || userId || '0';
  const hasLoadedOnce = useRef(false);
  const cacheTimestampRef = useRef<number | null>(null);
  const CACHE_KEY = `@softsolutions:profile-cache-${resolvedUserId}`;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditProfileData>({
    nomeUsuario: '',
    email: '',
    cpfUsuario: '',
    telefone: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      pais: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === 'ativo'),
    [enrollments],
  );

  useEffect(() => {
    const restoreCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            user: User;
            dashboard: any;
            profileImageUri: string | null;
            timestamp: number;
          };
          if (
            parsed?.user &&
            parsed?.dashboard &&
            parsed?.timestamp &&
            Date.now() - parsed.timestamp < CACHE_TTL
          ) {
            setUser(parsed.user);
            setEditData({
              nomeUsuario: parsed.user.nomeUsuario,
              email: parsed.user.email,
              cpfUsuario: parsed.user.cpfUsuario,
              telefone: parsed.user.telefone ?? '',
              endereco: {
                rua: parsed.user.endereco?.rua ?? '',
                numero: parsed.user.endereco?.numero ?? '',
                bairro: parsed.user.endereco?.bairro ?? '',
                cidade: parsed.user.endereco?.cidade ?? '',
                estado: parsed.user.endereco?.estado ?? '',
                pais: parsed.user.endereco?.pais ?? '',
              },
            });
            setDashboardData(parsed.dashboard);
            setProfileImageUri(parsed.profileImageUri ?? null);
            cacheTimestampRef.current = parsed.timestamp;
            hasLoadedOnce.current = true;
            setLoading(false);
          }
        }
      } catch (error) {
        console.warn('Falha ao restaurar cache do perfil', error);
      }
    };

    restoreCache().finally(() => {
      if (isAuthenticated && authUser) {
        const shouldShowSpinner = !hasLoadedOnce.current;
        loadUserData(true, shouldShowSpinner);
      } else {
        setLoading(false);
      }
    });
  }, [isAuthenticated, authUser]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || !hasLoadedOnce.current) {
        return;
      }
      loadUserData(false, false);
    }, [isAuthenticated]),
  );

  const persistCache = async (
    data: { user: User; dashboard: any; profileImageUri: string | null },
  ) => {
    try {
      const timestamp = Date.now();
      cacheTimestampRef.current = timestamp;
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ...data, timestamp }),
      );
    } catch (error) {
      console.warn('Não foi possível salvar cache do perfil', error);
    }
  };

  const loadUserData = async (forceRefresh = false, showSpinner = true) => {
    try {
      const now = Date.now();
      if (
        !forceRefresh &&
        cacheTimestampRef.current &&
        now - cacheTimestampRef.current < CACHE_TTL &&
        user &&
        dashboardData
      ) {
        if (showSpinner) {
          setLoading(false);
        }
        setTimeout(() => {
          loadUserData(true, false).catch((err) =>
            console.warn('Refresh silencioso do perfil falhou', err),
          );
        }, 0);
        return;
      }

      if (showSpinner) {
        setLoading(true);
      }
      const numericId = parseInt(resolvedUserId, 10);
      // Atualiza inscrições sem travar a UI.
      refreshEnrollments(forceRefresh).catch((err) =>
        console.warn('Falha ao atualizar inscrições no perfil', err),
      );

      const [userData, dashboard, savedImageUri] = await Promise.all([
        ApiService.getProfile(numericId),
        ApiService.getDashboard(numericId),
        ProfileImageService.getProfileImage(resolvedUserId),
      ]);
      
      setDashboardData(dashboard);
      setProfileImageUri(savedImageUri ?? null);
      
      const transformedUser: User = {
        ...userData,
        profileImageUri: savedImageUri ?? userData.profileImageUri ?? null,
      };
      
      setUser(transformedUser);
      setEditData({
        nomeUsuario: userData.nomeUsuario,
        email: userData.email,
        cpfUsuario: userData.cpfUsuario,
        telefone: formatPhone(userData.telefone ?? ''),
        endereco: {
          rua: userData.endereco?.rua ?? '',
          numero: userData.endereco?.numero ?? '',
          bairro: userData.endereco?.bairro ?? '',
          cidade: userData.endereco?.cidade ?? '',
          estado: userData.endereco?.estado ?? '',
          pais: userData.endereco?.pais ?? '',
        },
      });
      hasLoadedOnce.current = true;
      persistCache({ user: transformedUser, dashboard, profileImageUri: savedImageUri ?? null });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.nomeUsuario.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    if (!editData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }
    if (!editData.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }
    try {
      setSaving(true);
      
      // Atualizar dados na API
      const numericId = parseInt(resolvedUserId, 10);
      const updatedUser = await ApiService.updateProfile(numericId, {
        nomeUsuario: editData.nomeUsuario,
        email: editData.email,
        cpfUsuario: editData.cpfUsuario,
        telefone: editData.telefone,
        endereco: editData.endereco,
      });
      
      // Atualizar estado local
      const newUser: User = {
        ...updatedUser,
        profileImageUri: profileImageUri ?? updatedUser.profileImageUri ?? null,
      };
      setUser(newUser);
      
      // Atualizar contexto de autenticação
      updateUser({
        id: newUser.id,
        nomeUsuario: newUser.nomeUsuario,
        email: newUser.email,
        cpfUsuario: newUser.cpfUsuario,
        tipo: newUser.tipo,
        profileImageUri: newUser.profileImageUri,
        telefone: newUser.telefone,
        endereco: newUser.endereco,
      });
      
      setIsEditing(false);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', error.message || 'Erro ao atualizar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      nomeUsuario: user?.nomeUsuario || '',
      email: user?.email || '',
      cpfUsuario: user?.cpfUsuario || '',
      telefone: formatPhone(user?.telefone || ''),
      endereco: {
        rua: user?.endereco?.rua || '',
        numero: user?.endereco?.numero || '',
        bairro: user?.endereco?.bairro || '',
        cidade: user?.endereco?.cidade || '',
        estado: user?.endereco?.estado || '',
        pais: user?.endereco?.pais || '',
      },
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Alterar Senha',
      'Funcionalidade será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            try {
              await ApiService.logout();
              navigation.navigate('Home');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              navigation.navigate('Home');
            }
          }
        }
      ]
    );
  };

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar sua galeria de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await ProfileImageService.saveProfileImage(resolvedUserId, imageUri);
        setProfileImageUri(imageUri);
        
        // Atualizar o objeto user com a nova imagem
        if (user) {
          setUser({
            ...user,
            profileImageUri: imageUri,
          });
        }
        
        Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const removeProfileImage = async () => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover sua imagem de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProfileImageService.deleteProfileImage(resolvedUserId);
              setProfileImageUri(null);
              
              // Atualizar o objeto user removendo a imagem
              if (user) {
                setUser({
                  ...user,
                  profileImageUri: undefined,
                });
              }
              
              Alert.alert('Sucesso', 'Imagem de perfil removida com sucesso!');
            } catch (error) {
              console.error('Erro ao remover imagem:', error);
              Alert.alert('Erro', 'Erro ao remover imagem. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const formatCPF = (cpf: string) => {
    const digits = (cpf || '').replace(/\D/g, '');
    if (digits.length !== 11) {
      return cpf || 'Não informado';
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    const digits = (phone || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatAddress = (address?: User['endereco']) => {
    if (!address) {
      return 'Não informado';
    }

    const parts = [
      address.rua && address.numero
        ? `${address.rua}, ${address.numero}`
        : address.rua ?? '',
      address.bairro ?? '',
      address.cidade && address.estado
        ? `${address.cidade} - ${address.estado}`
        : address.cidade ?? address.estado ?? '',
      address.pais ?? '',
    ].filter((part) => part && part.trim().length > 0);

    return parts.length > 0 ? parts.join(' • ') : 'Não informado';
  };

  const handleAddressChange = (
    field: keyof EditProfileData['endereco'],
    value: string,
  ) => {
    setEditData((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value,
      },
    }));
  };

  const getEnrollmentStatusLabel = (enrollment: Enrollment) => {
    if (enrollment.status === 'concluido') {
      return 'Concluído';
    }
    if (enrollment.status === 'cancelado') {
      return 'Cancelado';
    }

    const progress = enrollment.progressoAulas || [];
    if (progress.length === 0) {
      return 'Não iniciado';
    }
    if (progress.every((item) => item.concluida)) {
      return 'Concluído';
    }
    if (progress.some((item) => item.concluida)) {
      return 'Em andamento';
    }
    return 'Não iniciado';
  };

  const getEnrollmentProgress = (enrollment: Enrollment) => {
    const progress = enrollment.progressoAulas || [];
    if (progress.length === 0) {
      return 0;
    }
    const completed = progress.filter((item) => item.concluida).length;
    return Math.round((completed / progress.length) * 100);
  };

  const handleCancelEnrollment = (enrollmentId: number) => {
    Alert.alert(
      'Cancelar inscrição',
      'Tem certeza que deseja se desinscrever deste curso?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => confirmCancelEnrollment(enrollmentId),
        },
      ],
    );
  };

  const confirmCancelEnrollment = async (enrollmentId: number) => {
    try {
      setCancellingId(enrollmentId);
      await ApiService.cancelarInscricao(enrollmentId);
      Alert.alert('Pronto', 'Inscrição cancelada com sucesso.');
      await loadUserData();
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível cancelar a inscrição agora.',
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Perfil" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Você precisa fazer login para ver seu perfil</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Perfil" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBackButton title="Meu Perfil" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profileImageUri 
                    ? { uri: profileImageUri }
                    : require('../assets/images/perfil.png')
                }
                style={styles.avatar}
              />
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
              {profileImageUri && (
                <TouchableOpacity 
                  style={styles.removeAvatarButton}
                  onPress={removeProfileImage}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userName}>{user?.nomeUsuario}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Profile Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dashboardData?.totalCursosInscritos || 0}</Text>
              <Text style={styles.statLabel}>Cursos Inscritos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dashboardData?.totalCertificados || 0}</Text>
              <Text style={styles.statLabel}>Certificados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dashboardData?.diasAtivosEstudo || 0}</Text>
              <Text style={styles.statLabel}>Dias Ativos</Text>
            </View>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            
            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.nomeUsuario}
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, nomeUsuario: text }))
                    }
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    selectionColor="#4a9eff"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.email}
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, email: text }))
                    }
                    placeholder="Digite seu email"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    selectionColor="#4a9eff"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CPF</Text>
                  <View style={[styles.input, styles.readOnlyInput]}>
                    <Text style={styles.readOnlyText}>
                      {formatCPF(editData.cpfUsuario) || 'Não informado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.telefone}
                    onChangeText={(text) =>
                      setEditData((prev) => ({ ...prev, telefone: formatPhone(text) }))
                    }
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    keyboardType="phone-pad"
                    maxLength={15}
                    selectionColor="#4a9eff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Endereço</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.endereco.rua}
                    onChangeText={(text) => handleAddressChange('rua', text)}
                    placeholder="Rua"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    selectionColor="#4a9eff"
                  />
                  <View style={styles.addressRow}>
                    <TextInput
                      style={[styles.input, styles.addressHalf]}
                      value={editData.endereco.numero}
                      onChangeText={(text) => handleAddressChange('numero', text)}
                      placeholder="Número"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      selectionColor="#4a9eff"
                    />
                    <TextInput
                      style={[styles.input, styles.addressHalf]}
                      value={editData.endereco.bairro}
                      onChangeText={(text) => handleAddressChange('bairro', text)}
                      placeholder="Bairro"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      selectionColor="#4a9eff"
                    />
                  </View>
                  <View style={styles.addressRow}>
                    <TextInput
                      style={[styles.input, styles.addressHalf]}
                      value={editData.endereco.cidade}
                      onChangeText={(text) => handleAddressChange('cidade', text)}
                      placeholder="Cidade"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      selectionColor="#4a9eff"
                    />
                    <TextInput
                      style={[styles.input, styles.addressHalf]}
                      value={editData.endereco.estado}
                      onChangeText={(text) => handleAddressChange('estado', text)}
                      placeholder="Estado"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      selectionColor="#4a9eff"
                    />
                  </View>
                  <TextInput
                    style={[styles.input, styles.countryInput]}
                    value={editData.endereco.pais}
                    onChangeText={(text) => handleAddressChange('pais', text)}
                    placeholder="País"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    selectionColor="#4a9eff"
                  />
                </View>
                
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Ionicons name="person" size={20} color="#4a9eff" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Nome Completo</Text>
                    <Text style={styles.infoValue}>{user?.nomeUsuario}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="mail" size={20} color="#4a9eff" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="card" size={20} color="#4a9eff" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>CPF</Text>
                    <Text style={styles.infoValue}>{formatCPF(user?.cpfUsuario || '')}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="call" size={20} color="#4a9eff" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Telefone</Text>
                    <Text style={styles.infoValue}>
                      {user?.telefone && user.telefone.trim().length > 0
                        ? user.telefone
                        : 'Não informado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="location" size={20} color="#4a9eff" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Endereço</Text>
                    <Text style={styles.infoValue}>{formatAddress(user?.endereco)}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}
                >
                  <Ionicons name="create" size={20} color="#4a9eff" />
                  <Text style={styles.editButtonText}>Editar Informações</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Enrollments */}
          <View style={styles.coursesSection}>
            <Text style={styles.sectionTitle}>Meus Cursos</Text>
            {activeEnrollments.length === 0 ? (
              <View style={styles.emptyCourses}>
                <Ionicons name="book-outline" size={36} color="#4a9eff" />
                <Text style={styles.emptyCoursesTitle}>
                  Você ainda não está inscrito em cursos ativos.
                </Text>
                <Text style={styles.helperText}>
                  Explore o catálogo e comece um novo curso agora mesmo.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('CursosLista')}
                >
                  <Text style={styles.primaryButtonText}>Explorar cursos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeEnrollments.map((enrollment) => (
                <View key={enrollment.id} style={styles.enrollmentCard}>
                  <View style={styles.enrollmentHeader}>
                    {enrollment.curso.imagemCurso ? (
                      <Image
                        source={{ uri: enrollment.curso.imagemCurso }}
                        style={styles.enrollmentImage}
                      />
                    ) : (
                      <View style={styles.enrollmentImagePlaceholder}>
                        <Ionicons name="school" size={20} color="#fff" />
                      </View>
                    )}
                    <View style={styles.enrollmentInfoWrapper}>
                      <Text style={styles.enrollmentCourse}>{enrollment.curso.nomeCurso}</Text>
                      <Text style={styles.enrollmentStatus}>
                        {getEnrollmentStatusLabel(enrollment)}
                      </Text>
                    </View>
                    <Text style={styles.enrollmentProgress}>
                      {getEnrollmentProgress(enrollment)}%
                    </Text>
                  </View>
                  <View style={styles.enrollmentActions}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() =>
                        navigation.navigate('AulasCurso', {
                          courseId: String(enrollment.curso.id),
                        })
                      }
                    >
                      <Ionicons name="play" size={18} color="#4a9eff" />
                      <Text style={styles.secondaryButtonText}>Assistir</Text>
                    </TouchableOpacity>
                    {enrollment.status === 'ativo' && (
                      <TouchableOpacity
                        style={[
                          styles.cancelEnrollmentButton,
                          cancellingId === enrollment.id && styles.buttonDisabled,
                        ]}
                        onPress={() => handleCancelEnrollment(enrollment.id)}
                        disabled={cancellingId === enrollment.id}
                      >
                        {cancellingId === enrollment.id ? (
                          <ActivityIndicator size="small" color="#e74c3c" />
                        ) : (
                          <>
                            <Ionicons name="close-circle" size={18} color="#e74c3c" />
                            <Text style={styles.cancelEnrollmentText}>Desinscrever</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Account Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Configurações da Conta</Text>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleChangePassword}
            >
              <Ionicons name="lock-closed" size={20} color="#4a9eff" />
              <Text style={styles.actionText}>Alterar Senha</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Certificados')}
            >
              <Ionicons name="school" size={20} color="#4a9eff" />
              <Text style={styles.actionText}>Meus Certificados</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Ionicons name="analytics" size={20} color="#4a9eff" />
              <Text style={styles.actionText}>Meu Dashboard</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Contato')}
            >
              <Ionicons name="help-circle" size={20} color="#4a9eff" />
              <Text style={styles.actionText}>Suporte</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#e74c3c" />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  profileHeader: {
    backgroundColor: '#4a9eff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2ecc71',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#b0c4de',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 30,
  },
  coursesSection: {
    marginBottom: 30,
  },
  emptyCourses: {
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    alignItems: 'center',
    gap: 10,
  },
  emptyCoursesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  enrollmentCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollmentImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  enrollmentImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  enrollmentInfoWrapper: {
    flex: 1,
  },
  enrollmentCourse: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  enrollmentStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  enrollmentProgress: {
    color: '#4a9eff',
    fontWeight: '600',
  },
  enrollmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelEnrollmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  cancelEnrollmentText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a9eff',
    marginTop: 10,
  },
  editButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  editForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: INPUT_TEXT_COLOR,
  },
  readOnlyInput: {
    backgroundColor: '#f1f1f1',
    borderColor: '#e0e0e0',
  },
  readOnlyText: {
    color: '#666',
    fontSize: 15,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  addressHalf: {
    flex: 1,
  },
  countryInput: {
    marginTop: 8,
  },
  helperText: {
    color: '#c0c0c0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a9eff',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4a9eff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutSection: {
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e74c3c',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
