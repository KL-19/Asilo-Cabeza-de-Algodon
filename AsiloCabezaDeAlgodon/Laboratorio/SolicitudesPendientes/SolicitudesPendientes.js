function abrirSolicitud() {

    document
        .getElementById("modalSolicitud")
        .classList.add("active");

}


function cerrarSolicitud() {

    document
        .getElementById("modalSolicitud")
        .classList.remove("active");

}


function procesarSolicitud() {

    cerrarSolicitud();

}


document
    .getElementById("modalSolicitud")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            cerrarSolicitud();

        }

    });
