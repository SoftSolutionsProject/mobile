/**
 * Utilitários para validações de formulários
 */

/**
 * Valida CPF brasileiro com dígito verificador
 * @param cpf - CPF sem formatação (apenas números)
 * @returns boolean - true se o CPF for válido
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF.charAt(10)) !== secondDigit) {
    return false;
  }
  
  return true;
};

/**
 * Aplica máscara de CPF
 * @param value - Valor sem formatação
 * @returns string - CPF formatado (000.000.000-00)
 */
export const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  const limitedValue = cleanValue.slice(0, 11);
  
  return limitedValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Valida telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns boolean - true se o telefone for válido
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 dígitos começando com 9)
  if (cleanPhone.length === 10) {
    // Telefone fixo
    return /^\d{2}[2-9]\d{7}$/.test(cleanPhone);
  } else if (cleanPhone.length === 11) {
    // Celular
    return /^\d{2}9\d{8}$/.test(cleanPhone);
  }
  
  return false;
};

/**
 * Aplica máscara de telefone brasileiro
 * @param value - Valor sem formatação
 * @returns string - Telefone formatado
 */
export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  const limitedValue = cleanValue.slice(0, 11);
  
  if (limitedValue.length <= 2) {
    return `(${limitedValue}`;
  } else if (limitedValue.length <= 6) {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2)}`;
  } else if (limitedValue.length <= 10) {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 6)}-${limitedValue.slice(6)}`;
  } else {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 7)}-${limitedValue.slice(7)}`;
  }
};

/**
 * Valida email
 * @param email - Email a ser validado
 * @returns boolean - true se o email for válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida senha forte
 * @param password - Senha a ser validada
 * @returns object - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Remove formatação de CPF
 * @param cpf - CPF formatado
 * @returns string - CPF apenas com números
 */
export const unformatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Remove formatação de telefone
 * @param phone - Telefone formatado
 * @returns string - Telefone apenas com números
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
