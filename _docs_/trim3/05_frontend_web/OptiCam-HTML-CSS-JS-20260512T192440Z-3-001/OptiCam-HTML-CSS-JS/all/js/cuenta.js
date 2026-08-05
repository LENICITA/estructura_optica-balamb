// LOGIN - Validación de usuarios registrados
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    
    if (!loginForm) return;
    
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        if (email === "" || password === "") {
            alert("❌ Completa todos los campos");
            return;
        }
        
        // ADMIN fijo (siempre disponible)
        if (email === "admin@gmail.com" && password === "123") {
            localStorage.setItem("rol", "admin");
            localStorage.setItem("email", email);
            localStorage.setItem("nombre", "Administrador");
            window.location.href = "../admin/principaladmin.html";
            return;
        }
        
        // Buscar en CLIENTES registrados
        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes.find(c => c.email === email && c.password === password);
        
        if (cliente) {
            localStorage.setItem("rol", "cliente");
            localStorage.setItem("email", cliente.email);
            localStorage.setItem("nombre", cliente.nombre);
            window.location.href = "../cliente/principal.html";
            return;
        }
        
        // Buscar en REPARTIDORES registrados
        let repartidores = JSON.parse(localStorage.getItem("repartidores")) || [];
        const repartidor = repartidores.find(r => r.email === email && r.password === password);
        
        if (repartidor) {
            localStorage.setItem("rol", "repartidor");
            localStorage.setItem("email", repartidor.email);
            localStorage.setItem("nombre", repartidor.nombre);
            window.location.href = "../repartidor/inicio-repartidor.html";
            return;
        }
        
        // Si no encuentra nada
        alert("❌ Correo o contraseña incorrectos. ¿No estás registrado?");
    });
});