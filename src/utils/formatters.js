export function formatCPF(cpf) {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
}

export function formatCEP(cep) {
  if (!cep) return '';
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatPlate(plate) {
  if (!plate) return '';
  return plate.toUpperCase();
}

export const MARITAL_STATUS_LABELS = {
  SINGLE: 'Solteiro(a)',
  MARRIED: 'Casado(a)',
  DIVORCED: 'Divorciado(a)',
  WIDOWED: 'Viúvo(a)',
  UNKNOWN: 'Não informado',
};

export const RENTAL_TYPE_LABELS = {
  MONTHLY: 'Mensal',
  FIFTEEN_DAYS: '15 Dias',
};

export const CONTRACT_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
  OVERDUE: 'Atrasado',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
};

export const PAYMENT_METHOD_LABELS = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
};

export const PAYMENT_TYPE_LABELS = {
  DEPOSIT: 'Caução / Depósito',
  WEEKLY: 'Pagamento Semanal',
  FULL_PAYMENT: 'Pagamento Integral (15 dias)',
  FINE: 'Multa',
};

export function getStatusColor(status) {
  const colors = {
    ACTIVE: 'var(--success)',
    FINISHED: 'var(--info)',
    CANCELLED: 'var(--danger)',
    OVERDUE: 'var(--warning)',
    PENDING: 'var(--warning)',
    PAID: 'var(--success)',
  };
  return colors[status] || 'var(--text-muted)';
}

export function getStatusBgColor(status) {
  const colors = {
    ACTIVE: 'var(--success-bg)',
    FINISHED: 'var(--info-bg)',
    CANCELLED: 'var(--danger-bg)',
    OVERDUE: 'var(--warning-bg)',
    PENDING: 'var(--warning-bg)',
    PAID: 'var(--success-bg)',
  };
  return colors[status] || 'transparent';
}
