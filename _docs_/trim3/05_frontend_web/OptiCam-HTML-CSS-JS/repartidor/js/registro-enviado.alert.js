document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
        title: "Registro enviado",
        text: "Ya hemos recibido el registro del pedido realizado.",
        icon: "success"
     }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "./subir-evidencia.html";
        }
    });
})});