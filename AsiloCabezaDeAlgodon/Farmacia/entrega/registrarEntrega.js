const modalEntrega =
    document.getElementById("modalEntrega");

const cerrarModalEntrega =
    document.getElementById("cerrarModalEntrega");

const cancelarModalEntrega =
    document.getElementById("cancelarModalEntrega");


function abrirEntrega() {
    modalEntrega.classList.add("active");
}


cerrarModalEntrega.addEventListener("click", function () {
    modalEntrega.classList.remove("active");
});

cancelarModalEntrega.addEventListener("click", function () {
    modalEntrega.classList.remove("active");
});

modalEntrega.addEventListener("click", function (event) {
    if (event.target === modalEntrega) {
        modalEntrega.classList.remove("active");
    }
});