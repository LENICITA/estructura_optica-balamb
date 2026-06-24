document.addEventListener("DOMContentLoaded", () => {

    //Imagen preview
    const input = document.getElementById("imagen");
    const preview = document.getElementById("preview");

    if (input && preview) {
        input.addEventListener("change", () => {
            preview.innerHTML = "";

            const file = input.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    preview.appendChild(img);
                };

                reader.readAsDataURL(file);
            }
        });
    }

    //Botón agregar
    const botonAgregar = document.querySelector(".add-product");

    if (!botonAgregar) {
        console.error("No se encontró el botón");
        return;
    }

    botonAgregar.addEventListener("click", () => {

        console.log("Click detectado");

        const nombre = document.getElementById("nombre")?.value;
        const descripcion = document.getElementById("descripcion")?.value;
        const categoria = document.getElementById("categoria")?.value;
        const marca = document.getElementById("marca")?.value;
        const material = document.getElementById("material")?.value;
        const color = document.getElementById("color")?.value;
        const precio = document.getElementById("precio")?.value;
        const imagenInput = document.getElementById("imagen");

        console.log(nombre, descripcion, categoria, marca, material, color, precio);

        if (!nombre || !descripcion || !categoria || !marca || !material || !color || !precio) {
            alert("Completa los campos");
            return;
        }

        if (imagenInput && imagenInput.files.length > 0) {

            const reader = new FileReader();

            reader.onload = function (e) {
                guardarProducto(nombre, descripcion, categoria, marca, material, color, precio, e.target.result);
            };

            reader.readAsDataURL(imagenInput.files[0]);

        } else {
            guardarProducto(nombre, descripcion, categoria, marca, material, color, precio, "");
        }
    });

});

//Guardar producto
function guardarProducto(nombre, descripcion, categoria, marca, material, color, precio, imagen) {

    const producto = {
        nombre,
        descripcion,
        categoria,
        marca,
        material,
        color,
        precio,
        imagen
    };

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos.push(producto);

    localStorage.setItem("productos", JSON.stringify(productos));

    alert("Producto agregado correctamente");

    window.location.href = "inventario.html";
}