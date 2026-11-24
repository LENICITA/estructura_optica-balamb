export const formatearFecha = (fechaString, incluirHora = false) => {
  if (!fechaString) return '';
  const date = new Date(fechaString);
  if (Number.isNaN(date.getTime())) return 'Invalid Date'; // Manejo seguro
  
  const opciones = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(incluirHora && { hour: '2-digit', minute: '2-digit' })
  };
  return date.toLocaleDateString('es-CO', opciones);
};

export const formatearMoneda = (valor) => {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`;
};

export const formatearEstado = (estado, mapa, fallback = null) => {
  return mapa[estado] || fallback || estado;
};