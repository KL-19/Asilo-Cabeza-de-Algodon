function abrirDetalle() {

        document
            .getElementById("detalleModal")
            .classList.add("show");

}


function cerrarDetalle() {

    document.getElementById("detalleModal")
        .classList.remove("show");

}


document.getElementById("detalleModal").addEventListener("click", function(event) {

    if (event.target === this) {
        cerrarDetalle();
    }

});


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        cerrarDetalle();
    }

});