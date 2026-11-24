export const adjuntarImagenFormData = (formData, imagen, campo = 'imagen', prefijo = 'archivo') => {
  if (!imagen) {
    console.log(`adjuntarImagen: ${campo} vacío/null`);
    return;
  }

  if (typeof File !== 'undefined' && imagen instanceof File) {
    console.log(`Adjuntando File web (${campo}):`, imagen.name);
    formData.append(campo, imagen, imagen.name);
    return;
  }

  if (typeof Blob !== 'undefined' && imagen instanceof Blob) {
    const ext = (imagen.type?.split('/')[1]) || 'jpg';
    const name = `${prefijo}_${Date.now()}.${ext}`;
    console.log(`Adjuntando Blob web (${campo}):`, name);
    formData.append(campo, imagen, name);
    return;
  }

  if (typeof imagen === 'object' && typeof imagen.uri === 'string') {
    const uri = imagen.uri;
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    const fileName = imagen.name || `${prefijo}_${Date.now()}.${fileType}`;
    let mimeType = imagen.type || 'image/jpeg';
    
    if (!imagen.type) {
      const lower = fileType.toLowerCase();
      if (lower === 'png') mimeType = 'image/png';
      else if (lower === 'gif') mimeType = 'image/gif';
      else if (lower === 'webp') mimeType = 'image/webp';
    }
    
    console.log(`Adjuntando RN asset (${campo}):`, fileName);
    formData.append(campo, { uri, name: fileName, type: mimeType });
    return;
  }

  if (typeof imagen === 'string') {
    const uriParts = imagen.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    const fileName = `${prefijo}_${Date.now()}.${fileType}`;
    let mimeType = 'image/jpeg';
    
    const lower = fileType.toLowerCase();
    if (lower === 'png') mimeType = 'image/png';
    else if (lower === 'gif') mimeType = 'image/gif';
    else if (lower === 'webp') mimeType = 'image/webp';

    console.log(`Adjuntando string uri (${campo}):`, fileName);
    formData.append(campo, { uri: imagen, name: fileName, type: mimeType });
    return;
  }

  console.log(`adjuntarImagen (${campo}): tipo no soportado:`, typeof imagen);
};

export const extraerMensajeError = (error, mensajePorDefecto, mensajesPersonalizados = {}) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  const status = error.response?.status;
  
  if (mensajesPersonalizados[status]) {
    return mensajesPersonalizados[status];
  }

  if (status === 400) return 'Datos inválidos. Verifica los campos.';
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'El recurso no fue encontrado.';
  if (status === 413) return 'El archivo es demasiado grande.';
  
  return mensajePorDefecto;
};