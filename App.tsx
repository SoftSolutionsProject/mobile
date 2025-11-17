import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import { CoursesProvider } from './src/contexts/CoursesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CoursesProvider>
          <AppNavigator />
          <StatusBar style="auto" />
          <Toast />
        </CoursesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
