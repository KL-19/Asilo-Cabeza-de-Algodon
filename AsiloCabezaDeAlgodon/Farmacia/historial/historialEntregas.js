const detalleModal =
    document.getElementById("detalleModal");

const cerrarDetalle =
    document.getElementById("cerrarDetalle");

const cerrarDetalleBoton =
    document.getElementById("cerrarDetalleBoton");

function abrirDetalle() {
    detalleModal.classList.add("active");
}

cerrarDetalle.addEventListener("click", function () {
    detalleModal.classList.remove("active");
});

cerrarDetalleBoton.addEventListener("click", function () {
    detalleModal.classList.remove("active");
});

detalleModal.addEventListener("click", function (event) {
    if (event.target === detalleModal) {
        detalleModal.classList.remove("active");
    }
});