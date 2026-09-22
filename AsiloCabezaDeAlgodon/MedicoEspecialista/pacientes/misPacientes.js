const buscarPaciente =
    document.getElementById("buscarPaciente");

const filtroPaciente =
    document.getElementById("filtroPaciente");

const filas =
    document.querySelectorAll("#tablaPacientes tr");

function filtrarPacientes() {
    const texto =
        buscarPaciente.value.toLowerCase().trim();

    const filtro =
        filtroPaciente.value;

    filas.forEach(function(fila) {
        const contenido =
            fila.textContent.toLowerCase();

        const estado =
            fila.getAttribute("data-estado");

        /* BUSCAR */
        const coincideBusqueda =
            contenido.includes(texto);

        /* FILTRO */
        let coincideFiltro = true;

        if (filtro !== "todos") {
            coincideFiltro =
                estado === filtro;
        }

        /* MOSTRAR / OCULTAR */
        if (
            coincideBusqueda &&
            coincideFiltro
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

/* BUSCAR MIENTRAS ESCRIBE */
buscarPaciente.addEventListener(
    "input",
    filtrarPacientes
);

/* FILTRO */
filtroPaciente.addEventListener(
    "change",
    filtrarPacientes
);

/* =====================================================
   ABRIR FICHA
===================================================== */
function abrirFicha(
    nombre,
    edad,
    diagnostico,
    observaciones
) {
    document.getElementById(
        "fichaNombre"
    ).textContent = nombre;

    document.getElementById(
        "fichaNombrePaciente"
    ).textContent = nombre;

    document.getElementById(
        "fichaEdad"
    ).textContent = edad;

    document.getElementById(
        "fichaDiagnostico"
    ).textContent = diagnostico;

    document.getElementById(
        "fichaObservaciones"
    ).textContent = observaciones;

    document.getElementById(
        "modalFicha"
    ).classList.add("active");
}

function cerrarFicha() {
    document.getElementById(
        "modalFicha"
    ).classList.remove("active");
}

document
    .getElementById("modalFicha")
    .addEventListener(
        "click",
        function(event) {
            if (event.target === this) {
                cerrarFicha();
            }
        }
    );