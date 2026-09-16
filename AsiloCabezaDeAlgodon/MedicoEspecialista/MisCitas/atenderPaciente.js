/* =====================================================
   MODO DE ATENCIÓN
===================================================== */
const parametros = new URLSearchParams(window.location.search);
const modoAtencion = parametros.get("modo");
const idAtencion = parametros.get("id");

/* FECHA AUTOMÁTICA */
function colocarFechaActual() {
    const fecha = new Date();
    const opciones = {
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    const fechaFormateada = fecha.toLocaleDateString(
        "es-ES",
        opciones
    );
    document.getElementById("fechaVisita").textContent = fechaFormateada;
}

/* DESPLEGAR EXÁMENES*/
function toggleExamenes() {
    const contenido = document.getElementById("examenesContent");
    const boton = document.getElementById("btnExamenes");
    contenido.classList.toggle("active");
    boton.classList.toggle("active");
}

/* DESPLEGAR MEDICAMENTOS*/
function toggleMedicamentos() {
    const contenido = document.getElementById("medicamentosContent");
    const boton =document.getElementById("btnMedicamentos");
    contenido.classList.toggle("active");
    boton.classList.toggle("active");

}

/* AGREGAR MEDICAMENTO*/
function agregarMedicamento() {
    const container = document.getElementById("medicamentosContainer");
    const cantidad = container.querySelectorAll(".medicine-item").length + 1;
    const nuevoMedicamento = document.createElement("div");
    nuevoMedicamento.classList.add("medicine-item");
    nuevoMedicamento.innerHTML = `
        <div class="medicine-number">
            ${cantidad}
        </div>

        <div class="medicine-fields">
            <div class="form-group">
                <label>
                    Medicamento
                </label>

                <input
                    type="text"
                    name="medicamento[]"
                    placeholder="Ej. Paracetamol"
                >
            </div>

            <div class="form-group">
                <label>
                    Cantidad
                </label>

                <input
                    type="text"
                    name="cantidad[]"
                    placeholder="Ej. 10 tabletas"
                >
            </div>

            <div class="form-group">
                <label>
                    Frecuencia / tiempo
                </label>

                <input
                    type="text"
                    name="frecuencia[]"
                    placeholder="Ej. Cada 8 horas"
                >
            </div>
        </div>
    `;
    container.appendChild(nuevoMedicamento);
}

/*ABRIR HISTORIAL*/
function abrirHistorial() {
    const modal = document.getElementById("modalHistorial");
    modal.classList.add("active");
}

/* CERRAR HISTORIAL*/
function cerrarHistorial() {
    const modal = document.getElementById("modalHistorial");
    modal.classList.remove("active");
}

/* CERRAR MODAL AL HACER CLICK AFUERA */
document
    .getElementById("modalHistorial")
    .addEventListener("click", function(event) {
        if (event.target === this) {
            cerrarHistorial();
        }
    });

/* CANCELAR ATENCIÓN */
function cancelarAtencion() {
    const confirmar =
        confirm(
            "¿Está seguro de cancelar la atención? Los datos ingresados se perderán."
        );
    if (confirmar) {
        if (modoAtencion === "resultados") {
            window.location.href =
                "../pendientesDeResultadosLab/citasPendientesResultados.html";
        } else {
            window.location.href =
                "../MisCitas/misCitas.html";
        }
    }
}

/* GUARDAR VISITA */
function guardarVisita() {
    const diagnostico =
        document.getElementById("diagnostico").value.trim();
    if (diagnostico === "") {
        alert(
            "Debe ingresar el diagnóstico antes de guardar la visita."
        );
        return;
    }

    /* =================================================
       MODO: REVISAR RESULTADOS
    ================================================= */
    if (modoAtencion === "resultados") {
        const diagnosticoFinal =
            document.getElementById("diagnosticoFinal").value.trim();
        if (diagnosticoFinal === "") {
            alert(
                "Debe ingresar el diagnóstico final antes de finalizar la atención."
            );
            return;
        }
        alert(
            "La atención médica fue finalizada correctamente."
        );
        window.location.href =
            "../pendientesDeResultadosLab/citasPendientesResultados.html";
        return;
    }

    /* ================================================
       MODO: PRIMERA ATENCIÓN
    ================================================= */
    const examenesSeleccionados =
        document.querySelectorAll(
            'input[name="examenes"]:checked'
        );
    if (examenesSeleccionados.length > 0) {
        alert(
            "La visita médica fue guardada.\n\n" +
            "Estado: Pendiente de resultados de laboratorio."
        );
    } else {
        alert(
            "La visita médica fue guardada.\n\n" +
            "Estado: Completada."
        );
    }
    window.location.href =
        "../MisCitas/misCitas.html";
    return;
}

/*INICIAR*/
document.addEventListener(
    "DOMContentLoaded",
    function() {
        colocarFechaActual();
        configurarModoAtencion();
    }
);

//*CON RESULTADOS DE LAB*//
function configurarModoAtencion() {
    const resultadosLaboratorio = document.getElementById("resultadosLaboratorio");
    const seccionFinal = document.getElementById("seccionFinal");
    const titulo = document.querySelector(".title-area h1");
    const descripcion = document.querySelector(".title-area p");
    const botonGuardar = document.querySelector(".btn-save");

    if (modoAtencion === "resultados") {
        resultadosLaboratorio.style.display = "block";
        seccionFinal.style.display = "block";
        titulo.textContent = "Revisar resultados de laboratorio";
        descripcion.textContent =
            "Revise los resultados y complete la información final de la atención médica.";
        botonGuardar.innerHTML = `
            <i class="ph ph-check"></i>
            Finalizar atención
        `;
    } else {
        resultadosLaboratorio.style.display = "none";
        seccionFinal.style.display = "none";
    }
}