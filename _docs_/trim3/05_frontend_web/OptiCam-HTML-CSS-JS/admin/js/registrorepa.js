// REGISTRO DE REPARTIDORES - Solo Admin
document.addEventListener("DOMContentLoaded", () => {
    // Verificar que solo el admin pueda acceder
    const rol = localStorage.getItem("rol");
    if (rol !== "admin") {
        alert("⛔ Acceso denegado. Solo administradores pueden registrar repartidores.");
        window.location.href = "iniciosesion.html";
        return;
    }
    
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
        const vehiculo = form.querySelector("#vehiculo").value;
        const modelo = form.querySelector("input[placeholder='Modelo']").value;
        const placa = form.querySelector("input[placeholder='Placa']").value;
        const color = form.querySelector("input[placeholder='Color']").value;
        
        // Validar
        if (!nombre || !email || !documento || !fechaNacimiento || !ciudad || !direccion || !telefono || !password || !vehiculo || !modelo || !placa || !color) {
            alert("❌ Completa todos los campos");
            return;
        }
        
        if (!email.endsWith("@gmail.com")) {
            alert("❌ El correo debe ser @gmail.com");
            return;
        }
        
        // Guardar
        let repartidores = JSON.parse(localStorage.getItem("repartidores")) || [];
        
        if (repartidores.find(r => r.email === email || r.documento === documento)) {
            alert("❌ Este email o documento ya está registrado");
            return;
        }
        
        const nuevoRepartidor = {
            id: Date.now(),
            nombre: nombre,
            email: email,
            documento: documento,
            fechaNacimiento: fechaNacimiento,
            ciudad: ciudad,
            direccion: direccion,
            telefono: telefono,
            password: password,
            vehiculo: vehiculo,
            modelo: modelo,
            placa: placa,
            color: color,
            rol: "repartidor",
            estado: "activo",
            fechaRegistro: new Date().toISOString()
        };
        
        repartidores.push(nuevoRepartidor);
        localStorage.setItem("repartidores", JSON.stringify(repartidores));
        
        alert("✅ ¡Repartidor registrado exitosamente!");
        window.location.href = "controlrepartidores.html";
    });
});