import Toast from 'react-native-toast-message';

export class NotificationService {
  static showSuccess(message: string, title?: string) {
    Toast.show({
      type: 'success',
      text1: title || 'Sucesso',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  }

  static showError(message: string, title?: string) {
    Toast.show({
      type: 'error',
      text1: title || 'Erro',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  }

  static showInfo(message: string, title?: string) {
    Toast.show({
      type: 'info',
      text1: title || 'Informação',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  }

  static showWarning(message: string, title?: string) {
    Toast.show({
      type: 'info',
      text1: title || 'Atenção',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  }

  static hide() {
    Toast.hide();
  }
}

export default NotificationService;

