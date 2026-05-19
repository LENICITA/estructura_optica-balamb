// ========== PRUEBA DE MONTURA VIRTUAL - CÓDIGO FUNCIONAL ==========
// VERSIÓN CORREGIDA Y MEJORADA

(function() {
    console.log('🚀 Iniciando prueba de montura virtual...');
    
    // ========== OBTENER ELEMENTOS DEL DOM ==========
    const video = document.getElementById('video-camara');
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const placeholder = document.getElementById('camara-placeholder');
    const btnActivar = document.getElementById('btn-activar-camara');
    const gafasLista = document.getElementById('gafas-lista');
    const btnDisminuir = document.getElementById('btn-disminuir');
    const btnAumentar = document.getElementById('btn-aumentar');
    const btnSubir = document.getElementById('btn-subir');
    const btnBajar = document.getElementById('btn-bajar');
    const btnCapturar = document.getElementById('btn-capturar');
    const tamañoValor = document.getElementById('tamaño-valor');
    const posicionValor = document.getElementById('posicion-valor');
    const resultadosContainer = document.getElementById('resultados-container');
    const fotosCapturadas = document.getElementById('fotos-capturadas');
    const btnDescargarTodas = document.getElementById('btn-descargar-todas');
    const btnLimpiarFotos = document.getElementById('btn-limpiar-fotos');
    
    // ========== VERIFICAR ELEMENTOS ==========
    console.log('Video:', video);
    console.log('Canvas:', canvas);
    console.log('Botón activar:', btnActivar);
    
    // ========== ESTADO DE LA APLICACIÓN ==========
    let stream = null;
    let camaraActiva = false;
    let gafaSeleccionada = null;
    let tamaño = 100;
    let posicionY = 0;
    let animationId = null;
    let gafaImagen = new Image();
    let fotosGuardadas = []; // Array para guardar fotos
    
    // ========== LISTA DE GAFAS DISPONIBLES (ACTUALIZADA CON IMÁGENES REALES) ==========
    const gafas = [
        { 
            id: 1, 
            nombre: "Ángel Gold", 
            precio: "$250.000", 
            imagen: "/img/producto1.png",
            imagenGafa: "/img/producto1.png"
        },
        { 
            id: 2, 
            nombre: "Sky Blue", 
            precio: "$180.000", 
            imagen: "/img/producto2.png",
            imagenGafa: "/img/producto2.png"
        },
        { 
            id: 3, 
            nombre: "Titanium Pro", 
            precio: "$350.000", 
            imagen: "/img/producto3.png",
            imagenGafa: "/img/producto3.png"
        },
        { 
            id: 4, 
            nombre: "Gafas Ámbar", 
            precio: "$250.000", 
            imagen: "/img/producto4.png",
            imagenGafa: "/img/producto4.png"
        }
    ];
    
    // ========== FUNCIÓN: CARGAR LISTA DE GAFAS ==========
    function cargarGafas() {
        if (!gafasLista) {
            console.error('❌ No se encontró el contenedor de gafas');
            return;
        }
        
        console.log('Cargando lista de gafas...');
        gafasLista.innerHTML = '';
        
        gafas.forEach((gafa, index) => {
            const item = document.createElement('div');
            item.className = 'gafa-item';
            if (index === 0) item.classList.add('seleccionada');
            item.dataset.id = gafa.id;
            
            item.innerHTML = `
                <img src="${gafa.imagen}" alt="${gafa.nombre}" onerror="this.src='/img/default-product.jpg'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                <div style="flex:1">
                    <strong>${gafa.nombre}</strong><br>
                    <small style="color:#B90F0F;">${gafa.precio}</small>
                </div>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.gafa-item').forEach(el => {
                    el.classList.remove('seleccionada');
                });
                item.classList.add('seleccionada');
                gafaSeleccionada = gafa;
                cargarImagenGafa();
                mostrarNotificacion(`👓 Probando: ${gafa.nombre}`, 'info');
                console.log('Gafa seleccionada:', gafa.nombre);
            });
            
            gafasLista.appendChild(item);
        });
        
        gafaSeleccionada = gafas[0];
        cargarImagenGafa();
        console.log('✅ Lista de gafas cargada');
    }
    
    // ========== FUNCIÓN: CARGAR IMAGEN DE LA GAFA ==========
    function cargarImagenGafa() {
        if (!gafaSeleccionada) return;
        
        console.log('Cargando imagen:', gafaSeleccionada.nombre);
        gafaImagen = new Image();
        gafaImagen.crossOrigin = "Anonymous";
        
        gafaImagen.onload = () => {
            console.log('✅ Imagen cargada correctamente');
            if (camaraActiva) dibujarGafa();
        };
        
        gafaImagen.onerror = (error) => {
            console.error('❌ Error cargando imagen:', error);
            gafaImagen.src = "https://placehold.co/400x200/B90F0F/white?text=👓+" + encodeURIComponent(gafaSeleccionada.nombre);
        };
        
        gafaImagen.src = gafaSeleccionada.imagenGafa || gafaSeleccionada.imagen;
    }
    
    // ========== FUNCIÓN: ACTIVAR CÁMARA ==========
    async function activarCamara() {
        console.log('📷 Intentando activar cámara...');
        
        // Verificar términos
        const terminosAceptados = localStorage.getItem('terminosCamara') === 'true';
        if (!terminosAceptados) {
            mostrarModalTerminos();
            return;
        }
        
        // Verificar si ya está activa
        if (camaraActiva) {
            console.log('Cámara ya está activa');
            return;
        }
        
        try {
            const constraints = {
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Cámara activada correctamente');
            
            if (video) {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    camaraActiva = true;
                    if (placeholder) placeholder.style.display = 'none';
                    actualizarTamañoCanvas();
                    iniciarAnimacion();
                    
                    // Cambiar texto del botón
                    if (btnActivar) {
                        btnActivar.innerHTML = '<i class="fa-solid fa-video"></i> Cámara activa';
                        btnActivar.style.background = '#4CAF50';
                    }
                    
                    mostrarNotificacion('✅ Cámara activada correctamente', 'success');
                };
            }
        } catch (error) {
            console.error('❌ Error al activar cámara:', error);
            
            let mensajeError = 'No se pudo acceder a la cámara. ';
            if (error.name === 'NotAllowedError') {
                mensajeError += 'Por favor, permite el acceso a la cámara en tu navegador.';
            } else if (error.name === 'NotFoundError') {
                mensajeError += 'No se encontró ninguna cámara en tu dispositivo.';
            } else {
                mensajeError += 'Verifica que tienes una cámara conectada.';
            }
            
            mostrarNotificacion(mensajeError, 'error');
            
            if (placeholder) {
                placeholder.style.display = 'flex';
                placeholder.innerHTML = `
                    <div style="text-align:center;">
                        <i class="fa-solid fa-camera" style="font-size:48px;color:#ccc;"></i>
                        <p style="margin-top:10px;">${mensajeError}</p>
                        <button onclick="location.reload()" style="margin-top:10px;padding:8px16px;background:#B90F0F;color:white;border:none;border-radius:5px;cursor:pointer;">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }
    
    // ========== FUNCIÓN: MOSTRAR MODAL DE TÉRMINOS ==========
    function mostrarModalTerminos() {
        const modal = document.getElementById('modalTerminos');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            // Crear modal si no existe
            crearModalTerminos();
        }
    }
    
    function crearModalTerminos() {
        const modalHTML = `
            <div id="modalTerminos" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;">
                <div style="background:white;border-radius:15px;max-width:500px;width:90%;padding:25px;max-height:80vh;overflow-y:auto;">
                    <h2 style="color:#B90F0F;">📸 Términos de uso de la cámara</h2>
                    <div style="margin:20px 0;">
                        <p><strong>Al activar la cámara, aceptas lo siguiente:</strong></p>
                        <ul style="margin-top:10px;">
                            <li>✅ La cámara se usará SOLO para probar las gafas virtualmente</li>
                            <li>✅ No se almacenan ni comparten tus imágenes en nuestros servidores</li>
                            <li>✅ Las fotos que captures se guardan solo en tu dispositivo</li>
                            <li>✅ Puedes desactivar la cámara en cualquier momento</li>
                        </ul>
                    </div>
                    <div style="margin:15px 0;">
                        <label style="display:flex;align-items:center;gap:10px;">
                            <input type="checkbox" id="aceptoTerminos"> Acepto los términos de uso
                        </label>
                        <label style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                            <input type="checkbox" id="aceptoPrivacidad"> Acepto la política de privacidad
                        </label>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:20px;">
                        <button id="btnAceptarTerminos" style="flex:1;background:#4CAF50;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;" disabled>Aceptar y activar</button>
                        <button id="btnRechazarTerminos" style="flex:1;background:#ccc;color:#333;border:none;padding:10px;border-radius:8px;cursor:pointer;">Rechazar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('modalTerminos');
        const checkAcepto = document.getElementById('aceptoTerminos');
        const checkPrivacidad = document.getElementById('aceptoPrivacidad');
        const btnAceptar = document.getElementById('btnAceptarTerminos');
        const btnRechazar = document.getElementById('btnRechazarTerminos');
        
        function actualizarBoton() {
            if (btnAceptar) {
                btnAceptar.disabled = !(checkAcepto?.checked && checkPrivacidad?.checked);
            }
        }
        
        if (checkAcepto) checkAcepto.addEventListener('change', actualizarBoton);
        if (checkPrivacidad) checkPrivacidad.addEventListener('change', actualizarBoton);
        
        if (btnAceptar) {
            btnAceptar.addEventListener('click', () => {
                localStorage.setItem('terminosCamara', 'true');
                modal.style.display = 'none';
                activarCamara();
            });
        }
        
        if (btnRechazar) {
            btnRechazar.addEventListener('click', () => {
                modal.style.display = 'none';
                mostrarNotificacion('Debes aceptar los términos para usar la cámara', 'warning');
            });
        }
    }
    
    // ========== FUNCIÓN: ACTUALIZAR TAMAÑO DEL CANVAS ==========
    function actualizarTamañoCanvas() {
        if (!canvas || !video) return;
        
        const rect = video.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            console.log('Canvas actualizado:', canvas.width, 'x', canvas.height);
        }
    }
    
    // ========== FUNCIÓN: INICIAR ANIMACIÓN ==========
    function iniciarAnimacion() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        function animar() {
            if (camaraActiva) {
                dibujarGafa();
            }
            animationId = requestAnimationFrame(animar);
        }
        
        animar();
        console.log('🎬 Animación iniciada');
    }
    
    // ========== FUNCIÓN: DIBUJAR GAFAS ==========
    function dibujarGafa() {
        if (!ctx || !canvas || !camaraActiva) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!gafaImagen || !gafaImagen.complete || gafaImagen.naturalWidth === 0) return;
        
        try {
            const baseAncho = canvas.width * 0.55;
            const ancho = baseAncho * (tamaño / 100);
            const alto = (gafaImagen.height / gafaImagen.width) * ancho;
            const x = (canvas.width - ancho) / 2;
            const y = (canvas.height / 2) - (alto / 2) + posicionY;
            
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(gafaImagen, -x - ancho, y, ancho, alto);
            ctx.restore();
        } catch (error) {
            console.error('Error dibujando gafas:', error);
        }
    }
    
    // ========== FUNCIÓN: AJUSTAR TAMAÑO ==========
    function ajustarTamaño(cambio) {
        let nuevoTamaño = tamaño + cambio;
        if (nuevoTamaño >= 50 && nuevoTamaño <= 150) {
            tamaño = nuevoTamaño;
            if (tamañoValor) tamañoValor.textContent = `${tamaño}%`;
            if (camaraActiva) dibujarGafa();
            console.log('Tamaño ajustado:', tamaño);
        }
    }
    
    // ========== FUNCIÓN: AJUSTAR POSICIÓN ==========
    function ajustarPosicion(cambio) {
        let nuevaPos = posicionY + cambio;
        if (nuevaPos >= -50 && nuevaPos <= 50) {
            posicionY = nuevaPos;
            if (posicionValor) posicionValor.textContent = posicionY;
            if (camaraActiva) dibujarGafa();
            console.log('Posición ajustada:', posicionY);
        }
    }
    
    // ========== FUNCIÓN: CAPTURAR FOTO ==========
    function capturarFoto() {
        if (!camaraActiva) {
            mostrarNotificacion('Primero activa la cámara haciendo clic en "Activar cámara"', 'warning');
            return;
        }
        
        console.log('📸 Capturando foto...');
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const rect = video.getBoundingClientRect();
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(video, -rect.width, 0, rect.width, rect.height);
        tempCtx.restore();
        
        if (canvas) {
            tempCtx.drawImage(canvas, 0, 0);
        }
        
        const fotoURL = tempCanvas.toDataURL('image/png');
        const id = Date.now();
        
        fotosGuardadas.push({ id, url: fotoURL });
        
        if (resultadosContainer) {
            resultadosContainer.style.display = 'block';
        }
        
        const fotoItem = document.createElement('div');
        fotoItem.className = 'foto-item';
        fotoItem.style.position = 'relative';
        fotoItem.innerHTML = `
            <img src="${fotoURL}" alt="Prueba de montura" style="width:100%;border-radius:10px;">
            <button onclick="this.parentElement.remove(); eliminarFoto(${id})" style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:25px;height:25px;cursor:pointer;">
                ✕
            </button>
        `;
        
        if (fotosCapturadas) {
            fotosCapturadas.appendChild(fotoItem);
        }
        
        mostrarNotificacion('✅ Foto capturada y guardada', 'success');
        resultadosContainer?.scrollIntoView({ behavior: 'smooth' });
        
        // Actualizar contador
        actualizarContadorFotos();
    }
    
    function eliminarFoto(id) {
        fotosGuardadas = fotosGuardadas.filter(f => f.id !== id);
        actualizarContadorFotos();
    }
    
    function actualizarContadorFotos() {
        const contador = document.getElementById('fotos-contador');
        if (contador) contador.textContent = fotosGuardadas.length;
    }
    
    function descargarTodasFotos() {
        if (fotosGuardadas.length === 0) {
            mostrarNotificacion('No hay fotos para descargar', 'warning');
            return;
        }
        
        fotosGuardadas.forEach((foto, index) => {
            const link = document.createElement('a');
            link.download = `prueba-montura-${index + 1}.png`;
            link.href = foto.url;
            link.click();
        });
        
        mostrarNotificacion(`📥 Descargando ${fotosGuardadas.length} fotos...`, 'success');
    }
    
    function limpiarFotos() {
        if (fotosGuardadas.length === 0) {
            mostrarNotificacion('No hay fotos para limpiar', 'info');
            return;
        }
        
        if (confirm('¿Eliminar todas las fotos capturadas?')) {
            fotosGuardadas = [];
            if (fotosCapturadas) fotosCapturadas.innerHTML = '';
            if (resultadosContainer) resultadosContainer.style.display = 'none';
            actualizarContadorFotos();
            mostrarNotificacion('🗑️ Todas las fotos han sido eliminadas', 'info');
        }
    }
    
    // ========== FUNCIÓN: DETENER CÁMARA ==========
    function detenerCamara() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        camaraActiva = false;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (btnActivar) {
            btnActivar.innerHTML = '<i class="fa-solid fa-camera"></i> Activar cámara';
            btnActivar.style.background = '';
        }
        
        if (placeholder) placeholder.style.display = 'flex';
        
        console.log('🛑 Cámara detenida');
    }
    
    // ========== NOTIFICACIONES ==========
    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        const colores = { success: '#4CAF50', warning: '#ff9800', error: '#f44336', info: '#2196F3' };
        const iconos = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
        
        notificacion.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colores[tipo] || '#333'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 10001;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;
        notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }
    
    // ========== CONFIGURAR EVENTOS ==========
    function configurarEventos() {
        if (btnActivar) {
            btnActivar.onclick = activarCamara;
            console.log('✅ Evento botón activar configurado');
        }
        
        if (btnDisminuir) btnDisminuir.onclick = () => ajustarTamaño(-5);
        if (btnAumentar) btnAumentar.onclick = () => ajustarTamaño(5);
        if (btnSubir) btnSubir.onclick = () => ajustarPosicion(-5);
        if (btnBajar) btnBajar.onclick = () => ajustarPosicion(5);
        if (btnCapturar) btnCapturar.onclick = capturarFoto;
        if (btnDescargarTodas) btnDescargarTodas.onclick = descargarTodasFotos;
        if (btnLimpiarFotos) btnLimpiarFotos.onclick = limpiarFotos;
        
        window.addEventListener('resize', () => {
            if (camaraActiva) {
                actualizarTamañoCanvas();
                dibujarGafa();
            }
        });
    }
    
    // ========== INICIALIZAR ==========
    function init() {
        console.log('🎯 Inicializando aplicación...');
        cargarGafas();
        configurarEventos();
        
        // Verificar si ya aceptó términos para no mostrar modal innecesariamente
        if (localStorage.getItem('terminosCamara') === 'true') {
            console.log('✅ Términos ya aceptados anteriormente');
        }
        
        console.log('✅ Aplicación inicializada correctamente');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Agregar estilos de animación si no existen
if (!document.querySelector('#animaciones-prueba')) {
    const style = document.createElement('style');
    style.id = 'animaciones-prueba';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .gafa-item {
            cursor: pointer;
            transition: all 0.3s;
        }
        .gafa-item:hover {
            transform: translateX(5px);
        }
        .gafa-item.seleccionada {
            border: 2px solid #B90F0F;
            background: #fff5f5;
        }
    `;
    document.head.appendChild(style);
}