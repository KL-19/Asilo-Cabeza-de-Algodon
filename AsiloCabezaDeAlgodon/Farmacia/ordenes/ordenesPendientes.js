const modalPrepararOrden =
    document.getElementById("modalPrepararOrden");

const cerrarModalPreparar =
    document.getElementById("cerrarModalPreparar");

const cancelarModalPreparar =
    document.getElementById("cancelarModalPreparar");

function abrirPrepararOrden() {
    modalPrepararOrden.classList.add("active");
}

cerrarModalPreparar.addEventListener("click", function () {
    modalPrepararOrden.classList.remove("active");
});

cancelarModalPreparar.addEventListener("click", function () {
    modalPrepararOrden.classList.remove("active");
});

modalPrepararOrden.addEventListener("click", function (event) {
    if (event.target === modalPrepararOrden) {
        modalPrepararOrden.classList.remove("active");
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        modalPrepararOrden.classList.remove("active");
    }
});