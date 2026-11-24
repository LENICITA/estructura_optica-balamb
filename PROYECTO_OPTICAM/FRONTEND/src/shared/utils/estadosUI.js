export const PEDIDOS_ESTADOS = {
  'Abonado': { color: '#2563EB', icon: 'fa-money-bill', label: 'Abonado (50%)' },
  'Listo': { color: '#7C3AED', icon: 'fa-circle-check', label: 'Listo para pagar' },
  'Pagado': { color: '#059669', icon: 'fa-credit-card', label: 'Pagado (100%)' },
  'En Proceso': { color: '#0284C7', icon: 'fa-rotate', label: 'En proceso' },
  'Enviado': { color: '#6366F1', icon: 'fa-rocket', label: 'Enviado' },
  'Entregado': { color: '#22C55E', icon: 'fa-check-double', label: 'Entregado' },
};

export const DISTRIBUCIONES_ESTADOS = {
  'PENDIENTE': { color: '#D97706', icon: 'fa-clock', label: 'Pendiente' },
  'EN_ENTREGA': { color: '#2563EB', icon: 'fa-motorcycle', label: 'En entrega' },
  'ENTREGADO': { color: '#22C55E', icon: 'fa-circle-check', label: 'Entregado' },
  'CANCELADO': { color: '#EF4444', icon: 'fa-circle-xmark', label: 'Cancelado' },
};

export const getEstadoColor = (estado, diccionario) => {
  return diccionario[estado]?.color || '#6B7280';
};

export const getEstadoBackground = (estado, diccionario) => {
  return `${getEstadoColor(estado, diccionario)}20`;
};

export const getEstadoIcon = (estado, diccionario) => {
  return diccionario[estado]?.icon || 'fa-circle-question';
};

export const getEstadoTexto = (estado, diccionario) => {
  return diccionario[estado]?.label || estado;
};