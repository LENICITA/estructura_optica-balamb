// REGISTRO DE CLIENTES - Autónomo
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".registro-box");
    if (!form) return;
    
    const btnCrearCuenta = form.querySelector(".crear-cuenta");
    
    btnCrearCuenta.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Obtener campos
        const nombre = form.querySelector("input[placeholder='Nombres y apellidos']").value;
        const email = form.querySelector("input[placeholder='Email']").value;
        const documento = form.querySelector("input[placeholder='Número de documento']").value;
        const fechaNacimiento = form.querySelector("input[type='date']").value;
        const ciudad = form.querySelector("input[placeholder='Ciudad']").value;
        const direccion = form.querySelector("input[placeholder='Dirección']").value;
        const telefono = form.querySelector("input[placeholder='Número de teléfono']").value;
        const password = form.querySelector("input[type='password']").value;
        
        // Validar
        if (!nombre || !email || !documento || !fechaNacimiento || !ciudad || !direccion || !telefono || !password) {
            alert("❌ Completa todos los campos");
            return;
        }
        
        if (!email.endsWith("@gmail.com")) {
            alert("❌ El correo debe ser @gmail.com");
            return;
        }
        
        if (password.length < 4) {
            alert("❌ La contraseña debe tener al menos 4 caracteres");
            return;
        }
        
        // Guardar
        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        
        if (clientes.find(c => c.email === email || c.documento === documento)) {
            alert("❌ Este email o documento ya está registrado");
            return;
        }
        
        const nuevoCliente = {
            id: Date.now(),
            nombre: nombre,
            email: email,
            documento: documento,
            fechaNacimiento: fechaNacimiento,
            ciudad: ciudad,
            direccion: direccion,
            telefono: telefono,
            password: password,
            rol: "cliente",
            fechaRegistro: new Date().toISOString()
        };
        
        clientes.push(nuevoCliente);
        localStorage.setItem("clientes", JSON.stringify(clientes));
        
        alert("✅ ¡Registro exitoso! Ahora inicia sesión");
        window.location.href = "iniciosesion.html";
    });
});