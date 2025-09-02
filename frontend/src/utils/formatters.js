/**
 * Utilitários para formatação de dados
 */

// Formatação de moeda brasileira
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de data brasileira
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

// Formatação de data e hora brasileira
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return dateString;
  }
};

// Formatação de horário
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return dateString;
  }
};

// Formatação de telefone brasileiro
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove tudo que não é dígito
  const cleaned = phone.replace(/\D/g, '');
  
  // Aplica formatação baseada no tamanho
  if (cleaned.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Celular: (00) 00000-0000
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

// Formatação de CPF
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  // Remove tudo que não é dígito
  const cleaned = cpf.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = cleaned.substring(0, 11);
  
  // Aplica formatação: 000.000.000-00
  return limited.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  // Remove tudo que não é dígito
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const limited = cleaned.substring(0, 14);
  
  // Aplica formatação: 00.000.000/0000-00
  return limited.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatação de CEP
export const formatCEP = (cep) => {
  if (!cep) return '';
  
  // Remove tudo que não é dígito
  const cleaned = cep.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limited = cleaned.substring(0, 8);
  
  // Aplica formatação: 00000-000
  return limited.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Formatação de número com separadores de milhar
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

// Formatação de porcentagem
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

// Capitalizar primeira letra de cada palavra
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Truncar texto com reticências
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

// Formatar tamanho de arquivo
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatar tempo em minutos para formato legível
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

// Validar CPF
export const isValidCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove formatação
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit > 9) firstDigit = 0;
  
  if (parseInt(cleaned.charAt(9)) !== firstDigit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit > 9) secondDigit = 0;
  
  return parseInt(cleaned.charAt(10)) === secondDigit;
};

// Validar email
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar telefone brasileiro
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Obter iniciais do nome
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Gerar cor baseada em string (para avatares)
export const getColorFromString = (str) => {
  if (!str) return '#6c757d';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Formatar status para exibição
export const formatStatus = (status) => {
  const statusMap = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    ativo: 'Ativo',
    inativo: 'Inativo',
    pendente: 'Pendente'
  };
  
  return statusMap[status] || status;
};

// Calcular horário de fim do agendamento baseado na duração do serviço
export const calculateAppointmentEndTime = (startTime, serviceDurationMinutes) => {
  if (!startTime || !serviceDurationMinutes) return null;
  
  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (serviceDurationMinutes * 60000));
    return end;
  } catch (error) {
    console.error('Erro ao calcular horário de fim:', error);
    return null;
  }
};

// Formatar intervalo de tempo do agendamento
export const formatAppointmentTimeRange = (startTime, serviceDurationMinutes) => {
  if (!startTime || !serviceDurationMinutes) return formatTime(startTime);
  
  const endTime = calculateAppointmentEndTime(startTime, serviceDurationMinutes);
  if (!endTime) return formatTime(startTime);
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatPhone,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatNumber,
  formatPercentage,
  capitalizeWords,
  truncateText,
  formatFileSize,
  formatDuration,
  isValidCPF,
  isValidEmail,
  isValidPhone,
  getInitials,
  getColorFromString,
  formatStatus,
  calculateAppointmentEndTime,
  formatAppointmentTimeRange
};
