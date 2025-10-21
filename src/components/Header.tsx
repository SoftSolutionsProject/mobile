import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, title }) => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateToScreen = (screenName: keyof RootStackParamList, params?: any) => {
    setMenuVisible(false);
    navigation.navigate(screenName, params);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setMenuVisible(false);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/images/cursos/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#4a9eff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Image
                source={require('../assets/images/cursos/logo.png')}
                style={styles.sidebarLogo}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#4a9eff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateToScreen('Home')}
              >
                <Text style={styles.menuItemText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateToScreen('CursosLista')}
              >
                <Text style={styles.menuItemText}>Cursos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateToScreen('QuemSomos')}
              >
                <Text style={styles.menuItemText}>Sobre</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateToScreen('Contato')}
              >
                <Text style={styles.menuItemText}>Contato</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateToScreen('Certificados')}
              >
                <Text style={styles.menuItemText}>Certificados</Text>
              </TouchableOpacity>
              
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateToScreen('Profile', { userId: user?.id || '1' })}
                >
                  <Text style={styles.menuItemText}>Perfil</Text>
                </TouchableOpacity>
              )}
              
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateToScreen('Dashboard')}
                >
                  <Text style={styles.menuItemText}>Dashboard</Text>
                </TouchableOpacity>
              )}
              
              {!isAuthenticated ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateToScreen('Cadastro')}
                  >
                    <Text style={styles.menuItemText}>Cadastre-se</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateToScreen('Login')}
                  >
                    <Text style={styles.menuItemText}>Login</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  menuButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#2d2d2d',
    paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  sidebarLogo: {
    width: 100,
    height: 30,
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  menuItemText: {
    fontSize: 16,
    color: '#4a9eff',
    fontWeight: '500',
  },
});

export default Header;
