import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AuthGuard from '../guards/AuthGuard';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import RecuperarSenhaScreen from '../screens/RecuperarSenhaScreen';
import QuemSomosScreen from '../screens/QuemSomosScreen';
import ContatoScreen from '../screens/ContatoScreen';
import CertificadosScreen from '../screens/CertificadosScreen';
import CursosListaScreen from '../screens/CursosListaScreen';
import DetalhesCursoScreen from '../screens/DetalhesCursoScreen';
import AulasCursoScreen from '../screens/AulasCursoScreen';
import AvaliacaoCursoScreen from '../screens/AvaliacaoCursoScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
        <Stack.Screen name="QuemSomos" component={QuemSomosScreen} />
        <Stack.Screen name="Contato" component={ContatoScreen} />
        <Stack.Screen name="Certificados" component={CertificadosScreen} />
        <Stack.Screen name="CursosLista" component={CursosListaScreen} />
        <Stack.Screen name="DetalhesCurso" component={DetalhesCursoScreen} />
        <Stack.Screen name="AulasCurso" component={AulasCursoScreen} />
        <Stack.Screen name="AvaliacaoCurso">
          {() => (
            <AuthGuard>
              <AvaliacaoCursoScreen />
            </AuthGuard>
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {() => (
            <AuthGuard>
              <DashboardScreen />
            </AuthGuard>
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {() => (
            <AuthGuard>
              <ProfileScreen />
            </AuthGuard>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
