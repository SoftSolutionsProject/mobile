import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const navigateToScreen = (screenName: keyof RootStackParamList, params?: any) => {
    navigation.navigate(screenName as any, params);
  };

  const isActive = (screenName: string) => {
    return route.name === screenName;
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <TouchableOpacity 
          style={[styles.footerItem, isActive('Home') && styles.activeFooterItem]}
          onPress={() => navigateToScreen('Home')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={isActive('Home') ? '#fff' : '#4a9eff'} 
          />
          <Text style={[
            styles.footerItemText, 
            isActive('Home') && styles.activeFooterItemText
          ]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerItem, isActive('CursosLista') && styles.activeFooterItem]}
          onPress={() => navigateToScreen('CursosLista')}
        >
          <Ionicons 
            name="book" 
            size={24} 
            color={isActive('CursosLista') ? '#fff' : '#4a9eff'} 
          />
          <Text style={[
            styles.footerItemText, 
            isActive('CursosLista') && styles.activeFooterItemText
          ]}>
            Cursos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerItem, isActive('Certificados') && styles.activeFooterItem]}
          onPress={() => navigateToScreen('Certificados')}
        >
          <Ionicons 
            name="school" 
            size={24} 
            color={isActive('Certificados') ? '#fff' : '#4a9eff'} 
          />
          <Text style={[
            styles.footerItemText, 
            isActive('Certificados') && styles.activeFooterItemText
          ]}>
            Certificados
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerItem, isActive('Profile') && styles.activeFooterItem]}
          onPress={() => navigateToScreen('Profile', { userId: '1' })}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={isActive('Profile') ? '#fff' : '#4a9eff'} 
          />
          <Text style={[
            styles.footerItemText, 
            isActive('Profile') && styles.activeFooterItemText
          ]}>
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#404040',
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  footerItemText: {
    fontSize: 12,
    color: '#4a9eff',
    marginTop: 4,
    fontWeight: '500',
  },
  activeFooterItem: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeFooterItemText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Footer;
