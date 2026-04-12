// MENÚ HAMBURGUESA + HEADER + MENSAJES
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("btn-menu");
    const menu = document.getElementById("menu");

    // ========== CONTROL DE AUTENTICACIÓN ==========
    function actualizarHeaderAutenticacion() {
        const iconsDiv = document.querySelector('.icons');
        if (!iconsDiv) return;

        const usuario = localStorage.getItem('email');
        const rol = localStorage.getItem('rol');

        if (usuario && rol) {
            if (rol === 'admin') {
                iconsDiv.innerHTML = `
                    <button id="btn-mensajes"><i class="fa-regular fa-envelope"></i></button>
                    <button onclick="window.location.href='admin/perfiladmin.html'" class="user-icon">
                        <i class="fa-solid fa-circle-user"></i>
                    </button>
                `;
            } else if (rol === 'repartidor') {
                iconsDiv.innerHTML = `
                    <button id="btn-mensajes"><i class="fa-regular fa-envelope"></i></button>
                    <button onclick="window.location.href='perfilrepa.html'" class="user-icon">
                        <i class="fa-solid fa-circle-user"></i>
                    </button>
                `;
            } else if (rol === 'cliente') {
                iconsDiv.innerHTML = `
                    <button onclick="window.location.href='carrito.html'">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button id="btn-mensajes"><i class="fa-regular fa-envelope"></i></button>
                    <button onclick="window.location.href='cliente/perfil.html'" class="user-icon">
                        <i class="fa-solid fa-circle-user"></i>
                    </button>
                `;
            }
        } else {
            iconsDiv.innerHTML = `
                <div class="auth-buttons">
                    <a href="../all/iniciosesion.html" class="login-btn">Iniciar sesión</a>
                    <a href="../cliente/registrarse.html" class="register-btn">Registrarse</a>
                </div>
            `;
        }
    }

    // ========== MENÚ SEGÚN ROL ==========
    function cargarMenu() {
        const rol = localStorage.getItem("rol");

        if (!menu) return;

        if (rol === "admin") {
            menu.innerHTML = `
                <a href="principaladmin.html">Dashboard</a>
                <a href="perfiladmin.html">Mi perfil</a>
                <a href="inventario.html">Inventario</a>
                <a href="adminPedidos.html">Pedidos</a>
                <a href="controlrepartidores.html">Repartidores</a>
                <a href="reportes.html">Reportes</a>
                <a href="#" id="cerrar-sesion">Cerrar sesión</a>
            `;
        } else if (rol === "cliente") {
            menu.innerHTML = `
                <a href="principal.html">Inicio</a>
                <a href="#">Productos</a>
                <a href="#">Mis pedidos</a>
                <a href="perfil.html">Mi perfil</a>
                <a href="contactenos.html">Contacto</a>
                <a href="#" id="cerrar-sesion">Cerrar sesión</a>
            `;
        } else if (rol === "repartidor") {
            menu.innerHTML = `
                <a href="/repartidor/inicio-repartidor.html">Inicio</a>
                <a href="/repartidor/historial.html">Historial</a>
                <a href="/repartidor/perfilrepa.html">Mi perfil</a>
                <a href="#" id="cerrar-sesion">Cerrar sesión</a>
            `;
        }

        // Evento cerrar sesión
        const cerrarSesion = document.getElementById("cerrar-sesion");
        if (cerrarSesion) {
            cerrarSesion.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.href = "../all/iniciosesion.html";
            });
        }
    }

    // ========== MENÚ HAMBURGUESA ==========
    if (btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("active");
        });

        menu.addEventListener("click", (e) => {
            if (e.target.tagName === 'A') {
                menu.classList.remove("active");
            }
        });
    }

    // ========== EVENTOS GLOBALES (SOLUCIÓN PRO) ==========
    
    // Click en botón de mensajes (funciona aunque se cree dinámicamente)
    document.addEventListener("click", (e) => {
        const panel = document.getElementById("panel-mensajes");

        if (e.target.closest("#btn-mensajes")) {
            e.stopPropagation();
            panel?.classList.toggle("active");
        } else {
            if (panel && !panel.contains(e.target)) {
                panel.classList.remove("active");
            }
        }
    });

    // ========== CARGAR MENSAJES ==========
    function cargarMensajes() {
        const rol = localStorage.getItem("rol");
        const mensajesLista = document.getElementById("mensajes-lista");

        if (!mensajesLista) return;

        if (rol === "admin") {
            mensajesLista.innerHTML = `
                <div class="mensaje"><i class="fa-solid fa-box"></i><div class="mensaje-contenido"><strong>📦 Nuevo pedido</strong><p>Pedido #1234 espera confirmación</p><small>Hace 5 min</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-truck"></i><div class="mensaje-contenido"><strong>🚚 Repartidor activo</strong><p>Juan Pérez cambió a estado "Activo"</p><small>Hace 1 hora</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-eye"></i><div class="mensaje-contenido"><strong>👓 Nueva fórmula</strong><p>Cliente envió fórmula médica</p><small>Hace 3 horas</small></div></div>
            `;
        } else if (rol === "cliente") {
            mensajesLista.innerHTML = `
                <div class="mensaje"><i class="fa-solid fa-truck"></i><div class="mensaje-contenido"><strong>📦 Tu pedido está en camino</strong><p>Llegará en 30 minutos</p><small>Hace 10 min</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-dollar-sign"></i><div class="mensaje-contenido"><strong>💰 Tu fórmula fue valorada</strong><p>Precio: $120,000</p><small>Hace 2 horas</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-tag"></i><div class="mensaje-contenido"><strong>🔔 Nueva promoción</strong><p>20% OFF en lentes de sol</p><small>Hace 1 día</small></div></div>
            `;
        } else if (rol === "repartidor") {
            mensajesLista.innerHTML = `
                <div class="mensaje"><i class="fa-solid fa-clipboard-list"></i><div class="mensaje-contenido"><strong>📋 Nuevo pedido</strong><p>Pedido #5678 asignado a ti</p><small>Hace 15 min</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-bell"></i><div class="mensaje-contenido"><strong>⚠️ Cliente te espera</strong><p>Pedido #1234 marcado como urgente</p><small>Hace 1 hora</small></div></div>
                <div class="mensaje"><i class="fa-solid fa-star"></i><div class="mensaje-contenido"><strong>⭐ Nueva calificación</strong><p>Recibiste 5 estrellas</p><small>Hace 3 horas</small></div></div>
            `;
        } else {
            // Si no hay sesión, mensajes por defecto
            mensajesLista.innerHTML = `
                <div class="mensaje"><i class="fa-solid fa-info-circle"></i><div class="mensaje-contenido"><strong>👋 Bienvenido</strong><p>Inicia sesión para ver tus notificaciones</p><small>Hoy</small></div></div>
            `;
        }
    }

    // ========== INICIALIZACIÓN ==========
    actualizarHeaderAutenticacion();
    cargarMenu();
    cargarMensajes();

});