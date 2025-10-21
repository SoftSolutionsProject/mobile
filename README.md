# Soft Solutions Mobile

Aplicativo mobile desenvolvido em React Native com Expo para a plataforma de cursos online Soft Solutions.

## Funcionalidades

- ✅ Autenticação completa (login/cadastro)
- ✅ Listagem de cursos com dados reais da API
- ✅ Dashboard com estatísticas do usuário
- ✅ Navegação protegida por autenticação
- ✅ Integração completa com a API backend
- ✅ Interface responsiva e moderna

## Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **Axios** - Requisições HTTP
- **AsyncStorage** - Armazenamento local
- **Context API** - Gerenciamento de estado

## Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mobile
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Instale o Expo CLI globalmente (se ainda não tiver):
```bash
npm install -g @expo/cli
```

## Configuração da API

O aplicativo está configurado para se conectar com a API backend na URL `http://localhost:4000`.

Para alterar a URL da API, edite o arquivo `src/config/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000' // Altere para a URL da sua API
};
```

## Executando o Projeto

### Desenvolvimento

1. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

2. Escaneie o QR code com o app Expo Go (Android/iOS) ou pressione:
   - `a` para abrir no Android
   - `i` para abrir no iOS
   - `w` para abrir no navegador

### Build para Produção

#### Android
```bash
expo build:android
```

#### iOS
```bash
expo build:ios
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.tsx
│   └── Footer.tsx
├── config/             # Configurações
│   └── environment.ts
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── guards/             # Guards de autenticação
│   └── AuthGuard.tsx
├── navigation/         # Configuração de navegação
│   └── AppNavigator.tsx
├── screens/           # Telas da aplicação
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── CadastroScreen.tsx
│   ├── DashboardScreen.tsx
│   └── ...
├── services/          # Serviços de API
│   └── ApiService.ts
├── types/             # Definições de tipos
│   └── index.ts
└── utils/             # Utilitários
    └── validations.ts
```

## Integração com a API

O aplicativo está totalmente integrado com a API backend e inclui:

### Autenticação
- Login de usuários
- Cadastro de novos usuários
- Gerenciamento de sessão
- Logout seguro

### Cursos
- Listagem de todos os cursos
- Detalhes de cursos específicos
- Inscrição em cursos
- Progresso de aulas

### Dashboard
- Estatísticas do usuário
- Cursos inscritos
- Certificados obtidos
- Tempo de estudo

### Perfil
- Visualização de dados do usuário
- Edição de informações
- Histórico de atividades

## Funcionalidades de Segurança

- **AuthGuard**: Protege telas que requerem autenticação
- **Validação de formulários**: Validação client-side robusta
- **Armazenamento seguro**: Tokens armazenados no AsyncStorage
- **Headers de autenticação**: Todas as requisições incluem token JWT

## Desenvolvimento

### Adicionando Novas Telas

1. Crie o componente da tela em `src/screens/`
2. Adicione a rota em `src/navigation/AppNavigator.tsx`
3. Adicione o tipo da rota em `src/types/index.ts`

### Adicionando Novos Endpoints

1. Adicione o método no `ApiService.ts`
2. Use o método nas telas que precisam dos dados

### Debugging

- Use `console.log()` para debug
- O React Native Debugger pode ser usado para debugging avançado
- Use o Expo DevTools para monitorar performance

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com a API**
   - Verifique se o backend está rodando
   - Confirme a URL da API no `environment.ts`

2. **Problemas de autenticação**
   - Verifique se o token está sendo salvo corretamente
   - Confirme se o backend está retornando o token

3. **Erro de build**
   - Limpe o cache: `expo r -c`
   - Reinstale as dependências: `rm -rf node_modules && npm install`

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.