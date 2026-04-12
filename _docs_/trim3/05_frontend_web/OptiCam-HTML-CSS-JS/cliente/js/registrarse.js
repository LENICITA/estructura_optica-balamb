// REGISTRO DE CLIENTES - Autónomo
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".registro-box");
    if (!form) {
        console.error("No se encontró el formulario con clase 'registro-box'");
        return;
    }
    
    const btnCrearCuenta = form.querySelector(".crear-cuenta");
    
    // Verificar si el botón existe
    if (!btnCrearCuenta) {
        console.error("No se encontró el botón con clase 'crear-cuenta'");
        return;
    }
    
    btnCrearCuenta.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Obtener campos - MÉTODO MÁS ROBUSTO usando name o id
        const nombre = form.querySelector("input[placeholder*='nombre']")?.value || 
                      form.querySelector("input[name='nombre']")?.value || "";
        
        const email = form.querySelector("input[placeholder*='Email']")?.value || 
                      form.querySelector("input[name='email']")?.value || "";
        
        const documento = form.querySelector("input[placeholder*='documento']")?.value || 
                          form.querySelector("input[name='documento']")?.value || "";
        
        const fechaNacimiento = form.querySelector("input[type='date']")?.value || "";
        
        const ciudad = form.querySelector("input[placeholder*='Ciudad']")?.value || 
                       form.querySelector("input[name='ciudad']")?.value || "";
        
        const direccion = form.querySelector("input[placeholder*='Dirección']")?.value || 
                          form.querySelector("input[name='direccion']")?.value || "";
        
        const telefono = form.querySelector("input[placeholder*='teléfono']")?.value || 
                         form.querySelector("input[placeholder*='telefono']")?.value ||
                         form.querySelector("input[name='telefono']")?.value || "";
        
        const password = form.querySelector("input[type='password']")?.value || "";
        
        // Validación mejorada
        if (!nombre || !email || !documento || !fechaNacimiento || !ciudad || !direccion || !telefono || !password) {
            alert("❌ Completa todos los campos");
            console.log("Campos faltantes:", {nombre, email, documento, fechaNacimiento, ciudad, direccion, telefono, password});
            return;
        }
        
        if (!email.includes("@") || !email.endsWith("@gmail.com")) {
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
        window.location.href = "/all/iniciosesion.html";
    });
});