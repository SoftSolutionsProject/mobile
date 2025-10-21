# 📸 Sistema de Imagens de Perfil - Local Storage

Este documento explica como funciona o sistema de armazenamento local de imagens de perfil implementado no aplicativo, usando SQLite para persistência de dados.

## 🎯 Visão Geral

O sistema permite que cada usuário tenha sua própria imagem de perfil armazenada localmente no dispositivo, sem depender do backend. As imagens são vinculadas ao `userId` e persistem entre sessões.

## 📚 Bibliotecas Utilizadas

### 1. **expo-sqlite**
```bash
npm install expo-sqlite
```
- **Função**: Banco de dados SQLite local
- **Uso**: Armazenar URIs das imagens de perfil
- **Vantagem**: Persistência local, funciona offline

### 2. **expo-image-picker**
```bash
npm install expo-image-picker
```
- **Função**: Seleção de imagens da galeria
- **Recursos**: 
  - Acesso à galeria de fotos
  - Edição/corte de imagens
  - Compressão automática
  - Solicitação de permissões

## 🏗️ Arquitetura do Sistema

### Estrutura de Arquivos
```
src/
├── services/
│   └── ProfileImageService.ts    # Serviço de banco SQLite
├── screens/
│   └── ProfileScreen.tsx         # Interface do usuário
├── types/
│   └── index.ts                  # Tipos TypeScript
└── contexts/
    └── AuthContext.tsx           # Contexto de autenticação
```

## 🗄️ Banco de Dados SQLite

### Tabela `profile_images`
```sql
CREATE TABLE IF NOT EXISTS profile_images (
  userId TEXT PRIMARY KEY,        -- ID único do usuário
  imageUri TEXT NOT NULL,         -- URI da imagem selecionada
  createdAt TEXT NOT NULL         -- Data de criação/atualização
);
```

### Chave Primária: `userId`
- **Por que usar userId?** Cada usuário tem uma imagem única
- **Isolamento**: Usuários não veem imagens uns dos outros
- **Persistência**: Imagem mantida entre logins

## 🔧 Serviço ProfileImageService

### Métodos Principais

#### 1. **Inicialização do Banco**
```typescript
async initDatabase(): Promise<void>
```
- Cria conexão com SQLite
- Executa script de criação da tabela
- Chamado automaticamente nos outros métodos

#### 2. **Salvar Imagem**
```typescript
async saveProfileImage(userId: string, imageUri: string): Promise<void>
```
- **Parâmetros**: ID do usuário + URI da imagem
- **Operação**: `INSERT OR REPLACE` (atualiza se já existe)
- **Timestamp**: Adiciona data/hora automaticamente

#### 3. **Buscar Imagem**
```typescript
async getProfileImage(userId: string): Promise<string | null>
```
- **Retorno**: URI da imagem ou `null` se não existir
- **Uso**: Carregar imagem ao abrir o perfil

#### 4. **Deletar Imagem**
```typescript
async deleteProfileImage(userId: string): Promise<void>
```
- **Função**: Remove imagem do usuário
- **Uso**: Botão "X" para remover foto

## 🖼️ Fluxo de Seleção de Imagem

### 1. **Solicitação de Permissão**
```typescript
const requestImagePickerPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
    return false;
  }
  return true;
};
```

### 2. **Abertura do Seletor**
```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Apenas imagens
  allowsEditing: true,                              // Permite editar
  aspect: [1, 1],                                   // Formato quadrado
  quality: 0.8,                                     // 80% da qualidade
});
```

### 3. **Salvamento no Banco**
```typescript
if (!result.canceled && result.assets[0]) {
  const imageUri = result.assets[0].uri;
  await ProfileImageService.saveProfileImage(userId, imageUri);
  setProfileImageUri(imageUri);
}
```

## 🔄 Fluxo de Carregamento

### 1. **Ao Abrir o Perfil**
```typescript
useEffect(() => {
  const loadUserData = async () => {
    // ... carregar dados do usuário ...
    
    // Carregar imagem de perfil do banco local
    const savedImageUri = await ProfileImageService.getProfileImage(userId);
    if (savedImageUri) {
      mockUser.profileImageUri = savedImageUri;
      setProfileImageUri(savedImageUri);
    }
  };
}, [userId]);
```

### 2. **Exibição Condicional**
```typescript
<Image
  source={
    profileImageUri 
      ? { uri: profileImageUri }                    // Imagem personalizada
      : require('../assets/images/perfil.png')      // Imagem padrão
  }
  style={styles.avatar}
/>
```

## 👥 Isolamento por Usuário

### Problema Resolvido
**Antes**: Footer usava `userId: '1'` fixo
```typescript
// ❌ PROBLEMA
onPress={() => navigateToScreen('Profile', { userId: '1' })}
```

**Depois**: Footer usa `userId` dinâmico
```typescript
// ✅ SOLUÇÃO
const { user } = useAuth();
onPress={() => navigateToScreen('Profile', { userId: user?.id || '1' })}
```

### Resultado
- **Usuário A** (id: "123") → vê imagem do Usuário A
- **Usuário B** (id: "456") → vê imagem do Usuário B
- **Navegação** mantém o usuário correto

## 🎨 Interface do Usuário

### Elementos Visuais

#### 1. **Avatar com Botões**
```typescript
<View style={styles.avatarContainer}>
  <Image source={...} style={styles.avatar} />
  
  {/* Botão de adicionar/editar */}
  <TouchableOpacity onPress={pickImage}>
    <Ionicons name="camera" size={16} color="#fff" />
  </TouchableOpacity>
  
  {/* Botão de remover (só aparece se tiver imagem) */}
  {profileImageUri && (
    <TouchableOpacity onPress={removeProfileImage}>
      <Ionicons name="close" size={12} color="#fff" />
    </TouchableOpacity>
  )}
</View>
```

#### 2. **Estilos dos Botões**
```typescript
editAvatarButton: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#2ecc71',    // Verde
  width: 32,
  height: 32,
  borderRadius: 16,
},

removeAvatarButton: {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: '#e74c3c',    // Vermelho
  width: 24,
  height: 24,
  borderRadius: 12,
},
```

## 🔒 Tratamento de Erros

### 1. **Permissões Negadas**
```typescript
if (status !== 'granted') {
  Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
  return false;
}
```

### 2. **Erro na Seleção**
```typescript
try {
  const result = await ImagePicker.launchImageLibraryAsync({...});
  // ... processar resultado
} catch (error) {
  console.error('Erro ao selecionar imagem:', error);
  Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
}
```

### 3. **Erro no Banco de Dados**
```typescript
try {
  await this.db!.runAsync(`INSERT OR REPLACE...`);
} catch (error) {
  console.error('Erro ao salvar imagem de perfil:', error);
  throw error;
}
```

## 📱 Vantagens do Sistema

### ✅ **Vantagens**
- **Offline**: Funciona sem internet
- **Rápido**: Acesso local instantâneo
- **Isolado**: Cada usuário tem sua imagem
- **Persistente**: Mantém entre sessões
- **Leve**: Apenas URIs, não as imagens em si
- **Simples**: Fácil de implementar e manter

### ⚠️ **Limitações**
- **Apenas local**: Não sincroniza entre dispositivos
- **Depende do dispositivo**: Se trocar de celular, perde as imagens
- **Sem backup**: Não há cópia de segurança automática

## 🚀 Como Usar

### Para o Desenvolvedor
1. **Importar o serviço**: `import ProfileImageService from '../services/ProfileImageService'`
2. **Usar os métodos**: `saveProfileImage()`, `getProfileImage()`, `deleteProfileImage()`
3. **Gerenciar estado**: `useState` para controlar a URI da imagem

### Para o Usuário
1. **Adicionar**: Toque no ícone da câmera
2. **Editar**: Toque novamente para trocar
3. **Remover**: Toque no "X" vermelho
4. **Visualizar**: Imagem aparece automaticamente

## 🔧 Manutenção

### Limpeza do Banco
```typescript
// Deletar todas as imagens (se necessário)
await ProfileImageService.deleteProfileImage(userId);
```

### Debug
```typescript
// Ver todas as imagens salvas
const allImages = await ProfileImageService.getAllProfileImages();
console.log('Imagens salvas:', allImages);
```

---

**Este sistema garante que cada usuário tenha sua imagem de perfil única e persistente, funcionando completamente offline e de forma isolada entre usuários.** 🎯
