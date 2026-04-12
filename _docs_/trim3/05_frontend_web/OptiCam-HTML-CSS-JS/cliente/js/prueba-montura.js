// ========== PRUEBA DE MONTURA VIRTUAL - CÓDIGO FUNCIONAL ==========
(function() {
    console.log('🚀 Iniciando prueba de montura...');
    
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
    
    // ========== VERIFICAR ELEMENTOS ==========
    console.log('Video:', video);
    console.log('Canvas:', canvas);
    console.log('Botón activar:', btnActivar);
    
    // ========== ESTADO DE LA APLICACIÓN ==========
    let stream = null;           // Flujo de la cámara
    let camaraActiva = false;    // Estado de la cámara
    let gafaSeleccionada = null; // Gafa actual
    let tamaño = 100;            // Tamaño en porcentaje (50-150%)
    let posicionY = 0;           // Posición vertical (-50 a 50)
    let animationId = null;      // ID de la animación
    let gafaImagen = new Image(); // Imagen de la gafa actual
    
    // ========== LISTA DE GAFAS DISPONIBLES ==========
    const gafas = [
        { 
            id: 1, 
            nombre: "Gafas Ámbar", 
            precio: "$250.000", 
            imagen: "https://placehold.co/400x200/B90F0F/white?text=👓+Gafas+Ambar" 
        },
        { 
            id: 2, 
            nombre: "Gafas Azul Marino", 
            precio: "$220.000", 
            imagen: "https://placehold.co/400x200/00008B/white?text=👓+Gafas+Azul" 
        },
        { 
            id: 3, 
            nombre: "Gafas Sol Polarizadas", 
            precio: "$320.000", 
            imagen: "https://placehold.co/400x200/000000/white?text=🕶️+Gafas+Sol" 
        },
        { 
            id: 4, 
            nombre: "Lentes Lectura", 
            precio: "$180.000", 
            imagen: "https://placehold.co/400x200/8B4513/white?text=👓+Lentes" 
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
                <img src="${gafa.imagen}" alt="${gafa.nombre}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
                <div style="flex:1">
                    <strong>${gafa.nombre}</strong><br>
                    <small style="color:#B90F0F;">${gafa.precio}</small>
                </div>
            `;
            
            item.addEventListener('click', () => {
                // Remover selección de todos
                document.querySelectorAll('.gafa-item').forEach(el => {
                    el.classList.remove('seleccionada');
                });
                item.classList.add('seleccionada');
                gafaSeleccionada = gafa;
                cargarImagenGafa();
                console.log('Gafa seleccionada:', gafa.nombre);
            });
            
            gafasLista.appendChild(item);
        });
        
        // Seleccionar primera gafa por defecto
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
            dibujarGafa();
        };
        
        gafaImagen.onerror = (error) => {
            console.error('❌ Error cargando imagen:', error);
            // Usar una imagen de respaldo
            gafaImagen.src = "https://placehold.co/400x200/666/white?text=Gafas";
        };
        
        gafaImagen.src = gafaSeleccionada.imagen;
    }
    
   // ========== MODIFICAR LA FUNCIÓN DEL BOTÓN ACTIVAR CÁMARA ==========
// Reemplaza la función activarCamara() original con esta:

function verificarYActivarCamara() {
    // Verificar si ya aceptó términos
    const terminosAceptados = localStorage.getItem('terminosCamara') === 'true';
    
    if (!terminosAceptados) {
        // Mostrar modal de términos
        const modal = document.getElementById('modalTerminos');
        if (modal) modal.style.display = 'flex';
        
        // Escuchar cuando acepte términos
        document.addEventListener('terminosAceptados', function onAceptado() {
            document.removeEventListener('terminosAceptados', onAceptado);
            iniciarActivacionCamara();
        });
    } else {
        iniciarActivacionCamara();
    }
}

async function iniciarActivacionCamara() {
    console.log('📷 Activando cámara con consentimiento...');
    // Aquí va el código original de activarCamara()
    try {
        const constraints = {
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Cámara activada con consentimiento del usuario');
        
        if (video) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                camaraActiva = true;
                if (placeholder) placeholder.style.display = 'none';
                actualizarTamañoCanvas();
                iniciarAnimacion();
            };
        }
    } catch (error) {
        console.error('Error al activar cámara:', error);
    }
}

// Cambiar el evento del botón
if (btnActivar) {
    btnActivar.onclick = verificarYActivarCamara;
}
    
    // ========== FUNCIÓN: ACTUALIZAR TAMAÑO DEL CANVAS ==========
    function actualizarTamañoCanvas() {
        if (!canvas || !video) return;
        
        const rect = video.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        console.log('Canvas actualizado:', canvas.width, 'x', canvas.height);
    }
    
    // ========== FUNCIÓN: INICIAR ANIMACIÓN ==========
    function iniciarAnimacion() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        function animar() {
            dibujarGafa();
            animationId = requestAnimationFrame(animar);
        }
        
        animar();
        console.log('🎬 Animación iniciada');
    }
    
    // ========== FUNCIÓN: DIBUJAR GAFAS EN EL CANVAS ==========
    function dibujarGafa() {
        if (!ctx || !canvas || !camaraActiva) return;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Verificar que la imagen esté cargada
        if (!gafaImagen || !gafaImagen.complete || gafaImagen.naturalWidth === 0) return;
        
        try {
            // Calcular tamaño dinámico
            const baseAncho = canvas.width * 0.5;  // 50% del ancho del canvas
            const ancho = baseAncho * (tamaño / 100);
            const alto = (gafaImagen.height / gafaImagen.width) * ancho;
            
            // Calcular posición (centrada horizontalmente)
            const x = (canvas.width - ancho) / 2;
            const y = (canvas.height / 2) - (alto / 2) + posicionY;
            
            // Dibujar con efecto espejo para que coincida con el video
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
            if (tamañoValor) {
                tamañoValor.textContent = `${tamaño}%`;
            }
            dibujarGafa();
            console.log('Tamaño ajustado:', tamaño);
        }
    }
    
    // ========== FUNCIÓN: AJUSTAR POSICIÓN ==========
    function ajustarPosicion(cambio) {
        let nuevaPos = posicionY + cambio;
        if (nuevaPos >= -50 && nuevaPos <= 50) {
            posicionY = nuevaPos;
            if (posicionValor) {
                posicionValor.textContent = posicionY;
            }
            dibujarGafa();
            console.log('Posición ajustada:', posicionY);
        }
    }
    
    // ========== FUNCIÓN: CAPTURAR FOTO ==========
    function capturarFoto() {
        if (!camaraActiva) {
            alert('Primero activa la cámara haciendo clic en "Activar cámara"');
            return;
        }
        
        console.log('📸 Capturando foto...');
        
        // Crear canvas temporal
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const rect = video.getBoundingClientRect();
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        
        // Dibujar video (con efecto espejo)
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(video, -rect.width, 0, rect.width, rect.height);
        tempCtx.restore();
        
        // Dibujar el canvas overlay (gafas)
        if (canvas) {
            tempCtx.drawImage(canvas, 0, 0);
        }
        
        // Convertir a imagen
        const fotoURL = tempCanvas.toDataURL('image/png');
        
        // Mostrar resultados
        if (resultadosContainer) {
            resultadosContainer.style.display = 'block';
        }
        
        // Agregar foto a la galería
        const fotoItem = document.createElement('div');
        fotoItem.className = 'foto-item';
        fotoItem.innerHTML = `
            <img src="${fotoURL}" alt="Prueba de montura" style="width:100%;border-radius:10px;">
            <button onclick="this.parentElement.remove()" style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:25px;height:25px;cursor:pointer;">
                ✕
            </button>
        `;
        
        if (fotosCapturadas) {
            fotosCapturadas.appendChild(fotoItem);
        }
        
        console.log('✅ Foto capturada y guardada');
        
        // Scroll a los resultados
        resultadosContainer.scrollIntoView({ behavior: 'smooth' });
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
        
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        console.log('🛑 Cámara detenida');
    }
    
    // ========== CONFIGURAR EVENTOS ==========
    function configurarEventos() {
        // Botón activar cámara
        if (btnActivar) {
            btnActivar.addEventListener('click', activarCamara);
            console.log('✅ Evento botón activar configurado');
        } else {
            console.error('❌ Botón activar cámara no encontrado');
        }
        
        // Botones de tamaño
        if (btnDisminuir) btnDisminuir.addEventListener('click', () => ajustarTamaño(-5));
        if (btnAumentar) btnAumentar.addEventListener('click', () => ajustarTamaño(5));
        
        // Botones de posición
        if (btnSubir) btnSubir.addEventListener('click', () => ajustarPosicion(-5));
        if (btnBajar) btnBajar.addEventListener('click', () => ajustarPosicion(5));
        
        // Botón capturar
        if (btnCapturar) btnCapturar.addEventListener('click', capturarFoto);
        
        // Redimensionar ventana
        window.addEventListener('resize', () => {
            if (camaraActiva) {
                actualizarTamañoCanvas();
                dibujarGafa();
            }
        });
    }
    
    // ========== INICIALIZAR TODO ==========
    function init() {
        console.log('🎯 Inicializando aplicación...');
        cargarGafas();
        configurarEventos();
        console.log('✅ Aplicación inicializada correctamente');
        console.log('ℹ️ Haz clic en "Activar cámara" para comenzar');
    }
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
 // ========== MODAL DE TÉRMINOS Y CONDICIONES ==========
    (function() {
        const modal = document.getElementById('modalTerminos');
        const checkAcepto = document.getElementById('aceptoTerminos');
        const checkPrivacidad = document.getElementById('aceptoPrivacidad');
        const btnAceptar = document.getElementById('btnAceptar');
        const btnRechazar = document.getElementById('btnRechazar');
        
        // Variable para saber si ya aceptó términos
        let terminosAceptados = localStorage.getItem('terminosCamara') === 'true';
        
        // Habilitar/deshabilitar botón según checkboxes
        function actualizarBoton() {
            if (checkAcepto && checkPrivacidad && btnAceptar) {
                btnAceptar.disabled = !(checkAcepto.checked && checkPrivacidad.checked);
            }
        }
        
        // Mostrar modal si no ha aceptado términos
        function mostrarModalSiNecesario() {
            if (!terminosAceptados) {
                if (modal) modal.style.display = 'flex';
            }
        }
        
        // Aceptar términos
        function aceptarTerminos() {
            terminosAceptados = true;
            localStorage.setItem('terminosCamara', 'true');
            if (modal) modal.style.display = 'none';
            
            // Mostrar mensaje de confirmación
            mostrarNotificacion('✅ Has aceptado los términos. Ahora puedes activar la cámara.', 'exito');
            
            // Ahora sí, activar la cámara
            if (typeof activarCamara === 'function') {
                activarCamara();
            } else {
                // Si la función no existe, lanzar evento
                document.dispatchEvent(new CustomEvent('terminosAceptados'));
            }
        }
        
        // Rechazar términos
        function rechazarTerminos() {
            if (modal) modal.style.display = 'none';
            mostrarNotificacion(
                '❌ No has aceptado los términos. No podemos activar la cámara por seguridad y privacidad.\n\nPuedes recargar la página si cambias de opinión.',
                'error'
            );
        }
        
        // Notificación temporal
        function mostrarNotificacion(mensaje, tipo) {
            const notificacion = document.createElement('div');
            notificacion.className = `notificacion-terminos ${tipo}`;
            notificacion.innerHTML = `
                <div style="background: ${tipo === 'exito' ? '#4CAF50' : '#f44336'}; color: white; padding: 15px; border-radius: 10px; margin: 10px; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; max-width: 90%; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                    ${mensaje}
                </div>
            `;
            document.body.appendChild(notificacion);
            setTimeout(() => notificacion.remove(), 5000);
        }
        
        // Eventos
        if (checkAcepto) checkAcepto.addEventListener('change', actualizarBoton);
        if (checkPrivacidad) checkPrivacidad.addEventListener('change', actualizarBoton);
        if (btnAceptar) btnAceptar.addEventListener('click', aceptarTerminos);
        if (btnRechazar) btnRechazar.addEventListener('click', rechazarTerminos);
        
        // Mostrar modal al cargar la página
        mostrarModalSiNecesario();
        
        // Escuchar evento de términos aceptados
        document.addEventListener('terminosAceptados', () => {
            if (typeof activarCamara === 'function') {
                activarCamara();
            }
        });
    })();