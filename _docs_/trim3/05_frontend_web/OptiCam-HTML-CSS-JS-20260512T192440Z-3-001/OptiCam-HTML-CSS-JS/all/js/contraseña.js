// RECUPERAR CONTRASEÑA - Simulado con localStorage
document.addEventListener("DOMContentLoaded", () => {
    const resetBox = document.querySelector(".reset-box");
    if (!resetBox) return;
    
    const emailInput = resetBox.querySelector("input[type='email']");
    const btnContinuar = resetBox.querySelector("button");
    const mensajeDiv = document.createElement("div");
    mensajeDiv.className = "mensaje-reset";
    resetBox.insertBefore(mensajeDiv, btnContinuar);
    
    btnContinuar.addEventListener("click", (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            mostrarMensaje("❌ Ingresa tu correo electrónico", "error");
            return;
        }
        
        if (!email.endsWith("@gmail.com")) {
            mostrarMensaje("❌ El correo debe ser @gmail.com", "error");
            return;
        }
        
        // Buscar en clientes registrados
        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        let repartidores = JSON.parse(localStorage.getItem("repartidores")) || [];
        
        const usuarioCliente = clientes.find(c => c.email === email);
        const usuarioRepartidor = repartidores.find(r => r.email === email);
        const usuarioAdmin = email === "admin@gmail.com";
        
        if (!usuarioCliente && !usuarioRepartidor && !usuarioAdmin) {
            mostrarMensaje("❌ No hay ninguna cuenta registrada con este correo", "error");
            return;
        }
        
        // Generar nueva contraseña aleatoria
        const nuevaContrasena = generarContrasena();
        
        // Actualizar contraseña según el tipo de usuario
        if (usuarioCliente) {
            usuarioCliente.password = nuevaContrasena;
            localStorage.setItem("clientes", JSON.stringify(clientes));
        } else if (usuarioRepartidor) {
            usuarioRepartidor.password = nuevaContrasena;
            localStorage.setItem("repartidores", JSON.stringify(repartidores));
        } else if (usuarioAdmin) {
            // Admin tiene contraseña fija, solo mostramos mensaje
            mostrarMensaje("⚠️ La contraseña del administrador solo puede cambiarla otro admin", "error");
            return;
        }
        
        // Mostrar nueva contraseña
        mostrarMensaje(`
            ✅ ¡Contraseña restablecida con éxito!
            📧 Tu nueva contraseña es: <strong>${nuevaContrasena}</strong>
            🔐 Por favor, inicia sesión con esta nueva contraseña.
        `, "success");
        
        // Limpiar input
        emailInput.value = "";
    });
    
    function generarContrasena() {
        const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
        const numeros = "23456789";
        let contrasena = "";
        
        // 4 letras aleatorias
        for (let i = 0; i < 4; i++) {
            contrasena += letras.charAt(Math.floor(Math.random() * letras.length));
        }
        // 4 números aleatorios
        for (let i = 0; i < 4; i++) {
            contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
        }
        
        return contrasena;
    }
    
    function mostrarMensaje(texto, tipo) {
        mensajeDiv.innerHTML = texto;
        mensajeDiv.className = `mensaje-reset ${tipo}`;
        mensajeDiv.style.display = "block";
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            mensajeDiv.style.opacity = "0";
            setTimeout(() => {
                mensajeDiv.style.display = "none";
                mensajeDiv.style.opacity = "1";
            }, 300);
        }, 5000);
    }
});