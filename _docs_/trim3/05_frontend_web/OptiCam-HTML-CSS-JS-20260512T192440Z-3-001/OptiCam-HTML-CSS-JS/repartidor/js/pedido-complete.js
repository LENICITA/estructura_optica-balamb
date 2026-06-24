document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
        title: "Pedido completado",
        text: "Haz completado la entrega del pedido. ¡Gracias por tu excelente trabajo!",
        icon: "success"
     }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "./inicio-repartidor.html";
        }
    });
})});