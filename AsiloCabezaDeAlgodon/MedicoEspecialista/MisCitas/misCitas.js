function abrirVisita() {
    document.getElementById("modalVisita").classList.add("active");
}

function cerrarVisita() {
    document.getElementById("modalVisita").classList.remove("active");
}

// Cerrar al hacer clic fuera del modal
document.getElementById("modalVisita").addEventListener("click", function(event) {
    if (event.target === this) {
        cerrarVisita();
    }
});