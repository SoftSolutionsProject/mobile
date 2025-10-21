// Configuração para diferentes ambientes
const getApiUrl = () => {
  // Para desenvolvimento, você pode alternar entre localhost e IP da rede
  const useLocalhost = false; // Mude para true se quiser usar localhost
  
  if (useLocalhost) {
    return 'http://localhost:4000';
  } else {
    // Substitua pelo IP da sua máquina na rede local
    // Para descobrir seu IP: no Windows: ipconfig, no Mac/Linux: ifconfig
    return 'http://192.168.0.194:4000'; // ALTERE ESTE IP
  }
};

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
  // URLs alternativas para teste
  alternativeUrls: [
    'http://localhost:4000',
    'http://192.168.0.194:4000', // Substitua pelo seu IP
    'http://10.0.2.2:4000', // IP do emulador Android
  ]
};
