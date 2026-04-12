document.querySelectorAll(".viewAlerta").forEach(function(boton) {
    boton.addEventListener("click", function() {
        Swal.fire({
        title: "Reporte enviado",
        text: "Ya hemos recibido tu reporte. Nos pondremos en contacto contigo lo antes posible para resolver el inconveniente.",
        icon: "success"
     }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "./inicio-repartidor.html";
        }
    });
})});