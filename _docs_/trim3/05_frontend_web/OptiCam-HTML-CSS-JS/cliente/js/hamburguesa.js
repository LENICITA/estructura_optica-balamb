// MENÚ HAMBURGUESA - Este archivo se incluye en TODAS las páginas
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-menu");
    const menu = document.getElementById("menu");
    
    if (!btn || !menu) return;

    // Función para cargar el menú según el rol
    function cargarMenu() {
        const rol = localStorage.getItem("rol");
        console.log("Rol actual:", rol);
        
        if (!menu) return;
        
        if (rol === "admin") {
            menu.innerHTML = `
                <a href="principaladmin.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
                <a href="perfiladmin.html"><i class="fa-solid fa-user"></i> Mi perfil</a>
                <a href="inventario.html"><i class="fa-solid fa-box"></i> Inventario</a>
                <a href="adminPedidos.html"><i class="fa-solid fa-cart-shopping"></i> Pedidos</a>
                <a href="controlrepartidores.html"><i class="fa-solid fa-motorcycle"></i> Repartidores</a>
                <a href="reportes.html"><i class="fa-solid fa-chart-pie"></i> Reportes</a>
                <a href="iniciosesion.html"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</a>
            `;
        } else if (rol === "cliente") {
            menu.innerHTML = `
                <a href="principal.html"><i class="fa-solid fa-house"></i> Inicio</a>
                <a href="#"><i class="fa-solid fa-shop"></i> Productos</a>
                <a href="#"><i class="fa-solid fa-bag-shopping"></i> Mis pedidos</a>
                <a href="perfil.html"><i class="fa-solid fa-user"></i> Mi perfil</a>
                <a href="contactenos.html"><i class="fa-solid fa-phone"></i> Contacto</a>
                <a href="iniciosesion.html"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</a>
            `;

            } else if (rol === "repartidor") {  
            menu.innerHTML = `
                <a href="iniciorepartidor.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
                <a href="#"><i class="fa-solid fa-cart-shopping"></i> Pedidos</a>
                <a href="#"><i class="fa-solid fa-user"></i> Mi perfil</a>
                <a href="iniciosesion.html"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</a>
            `;
        }
    }
    
    // Cargar el menú inicial
    if (menu) {
        cargarMenu();
    }
    
    // Evento para abrir/cerrar menú
    if (btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("active");
        });
        
        // Cerrar menú al hacer click en un enlace
        menu.addEventListener("click", (e) => {
            if (e.target.tagName === 'A' || e.target.parentElement?.tagName === 'A') {
                menu.classList.remove("active");
            }
        });
    }

    menu.addEventListener("click", (e) => {
    if (e.target.closest('a[href="iniciosesion.html"]')) {
        localStorage.removeItem("rol"); // Borrar el rol
    }
});
});

// ========== PANEL DE MENSAJES ==========
document.addEventListener("DOMContentLoaded", () => {
    // ========== PANEL DE MENSAJES ==========
    const btnMensajes = document.getElementById("btn-mensajes");
    const panelMensajes = document.getElementById("panel-mensajes");
    
    if (btnMensajes && panelMensajes) {
        // Abrir/cerrar panel
        btnMensajes.addEventListener("click", (e) => {
            e.stopPropagation();
            panelMensajes.classList.toggle("active");
        });
        
        // Cerrar al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (!panelMensajes.contains(e.target) && !btnMensajes.contains(e.target)) {
                panelMensajes.classList.remove("active");
            }
        });
        
        // Cargar mensajes según el rol
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
        
        cargarMensajes();
    }
});