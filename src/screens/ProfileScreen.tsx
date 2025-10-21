import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';
import ProfileImageService from '../services/ProfileImageService';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { userId } = route.params || { userId: '1' };
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nomeUsuario: '',
    email: '',
    cpfUsuario: '',
  });
  const [loading, setLoading] = useState(true);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Mock data - em produção viria da API baseado no userId
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: userId,
          nomeUsuario: 'João Silva',
          email: 'joao.silva@email.com',
          cpfUsuario: '12345678901',
        };
        
        // Carregar imagem de perfil do banco local
        const savedImageUri = await ProfileImageService.getProfileImage(userId);
        if (savedImageUri) {
          mockUser.profileImageUri = savedImageUri;
          setProfileImageUri(savedImageUri);
        }
        
        setUser(mockUser);
        setEditData({
          nomeUsuario: mockUser.nomeUsuario,
          email: mockUser.email,
          cpfUsuario: mockUser.cpfUsuario,
        });
      } catch (err) {
        Alert.alert('Erro', 'Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
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
    if (!editData.cpfUsuario.trim()) {
      Alert.alert('Erro', 'CPF é obrigatório');
      return;
    }

    // Mock salvamento - em produção seria uma chamada à API
    setUser({
      ...user!,
      nomeUsuario: editData.nomeUsuario,
      email: editData.email,
      cpfUsuario: editData.cpfUsuario,
    });
    setIsEditing(false);
    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
  };

  const handleCancel = () => {
    setEditData({
      nomeUsuario: user?.nomeUsuario || '',
      email: user?.email || '',
      cpfUsuario: user?.cpfUsuario || '',
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => navigation.navigate('Home') }
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
        await ProfileImageService.saveProfileImage(userId, imageUri);
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
              await ProfileImageService.deleteProfileImage(userId);
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
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showBackButton title="Perfil" />
        <View style={styles.loadingContainer}>
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
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Cursos Inscritos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Certificados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>45</Text>
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
                    onChangeText={(text) => setEditData({...editData, nomeUsuario: text})}
                    placeholder="Digite seu nome completo"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.email}
                    onChangeText={(text) => setEditData({...editData, email: text})}
                    placeholder="Digite seu email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.cpfUsuario}
                    onChangeText={(text) => setEditData({...editData, cpfUsuario: text.replace(/\D/g, '')})}
                    placeholder="Digite seu CPF"
                    keyboardType="numeric"
                    maxLength={11}
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
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Salvar</Text>
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
