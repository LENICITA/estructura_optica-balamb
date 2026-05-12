document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
            title: "¿Estás seguro de iniciar la entrega?",
            text: "Debes cumplir con la entrega en el tiempo establecido para evitar sanciones.",
            icon: "info",
            confirmButtonText: "OK"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "./detalles-pedido.html";
            }
        });
    });
});