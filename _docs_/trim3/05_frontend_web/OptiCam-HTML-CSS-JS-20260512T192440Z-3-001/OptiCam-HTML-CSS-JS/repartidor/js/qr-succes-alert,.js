document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
        title: "QR leído con éxito",
        text: "¡Has completado la lectura del QR! Ahora puedes proceder con la entrega del pedido.",
        icon: "success"
     }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "./subir-evidencia.html";
        }
    });
})});