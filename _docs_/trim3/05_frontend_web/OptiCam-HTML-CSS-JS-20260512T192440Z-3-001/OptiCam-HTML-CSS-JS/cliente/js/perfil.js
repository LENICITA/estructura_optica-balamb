
let editando = false;

function activarEdicion(){
    editando = true;

    document.getElementById("direccion").disabled = false;
    document.getElementById("password").disabled = false;
    document.getElementById("correo").disabled = false;
    document.getElementById("telefono").disabled = false;

    alert("Ahora puedes editar tu información ✏️");
}

function guardar(){
    if(!editando){
        alert("Primero presiona EDITAR PERFIL");
        return;
    }

    const direccion = document.getElementById("direccion").value;
    const correo = document.getElementById("correo").value;

    if(direccion === "" || correo === ""){
        alert("Completa los campos obligatorios");
        return;
    }

    alert("Datos guardados correctamente ✅");

    document.getElementById("direccion").disabled = true;
    document.getElementById("password").disabled = true;
    document.getElementById("correo").disabled = true;
    document.getElementById("telefono").disabled = true;

    editando = false;
}

function subirFoto(){
    const input = document.getElementById("foto");
    input.click();

    input.onchange = function(){
        const file = input.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = function(e){
                document.getElementById("preview").src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    }
}
