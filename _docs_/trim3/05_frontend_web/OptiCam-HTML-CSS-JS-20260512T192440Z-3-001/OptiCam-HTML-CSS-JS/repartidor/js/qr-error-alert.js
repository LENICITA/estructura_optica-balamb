document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
         icon: "error",
         title: "Oops...",
         text: "Algo salió mal. No se pudo completar la lectura del QR.",
         footer: "<a href=\"./registro-manual.html\">Hacer registro manual</a>"
        }); then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/detalles-pedido.html";
        }});
    });
});