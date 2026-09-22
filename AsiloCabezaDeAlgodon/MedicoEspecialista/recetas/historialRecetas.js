/* ================= FILTRAR HISTORIAL ================= */
function filtrarHistorial() {
    const texto =
        document.getElementById("buscar").value
        .toLowerCase()
        .trim();

    const medicamento =
        document.getElementById("medicamento").value;

    const desde =
        document.getElementById("desde").value;

    const hasta =
        document.getElementById("hasta").value;

    /* Validar rango de fechas */
    if (desde !== "" && hasta !== "" && desde > hasta) {
        alert(
            "La fecha Desde no puede ser mayor que la fecha Hasta."
        );
        return;
    }

    const filas =
        document.querySelectorAll("#tablaRecetas tr");

    filas.forEach(function(fila) {

        const paciente =
            fila.dataset.paciente.toLowerCase();

        const expediente =
            fila.dataset.expediente.toLowerCase();

        const medicamentoFila =
            fila.dataset.medicamento;

        const fecha =
            fila.dataset.fecha;

        /* ================= TEXTO ================= */
        const coincideTexto =
            paciente.includes(texto) ||
            expediente.includes(texto);

        /* ================= MEDICAMENTO ================= */
        const coincideMedicamento =
            medicamento === "" ||
            medicamentoFila === medicamento;

        /* ================= FECHA ================= */
        let coincideFecha = true;

        if (desde !== "" && fecha < desde) {
            coincideFecha = false;
        }

        if (hasta !== "" && fecha > hasta) {
            coincideFecha = false;
        }

        /* ================= MOSTRAR ================= */
        if (
            coincideTexto &&
            coincideMedicamento &&
            coincideFecha
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

/* ================= VER RECETA ================= */
function verReceta(
    idAtencion,
    paciente,
    expediente,
    fecha,
    estado
) {

    /* ================= INFORMACIÓN ================= */
    document.getElementById("modalPaciente").textContent =
        paciente;

    document.getElementById("modalExpediente").textContent =
        "Expediente " + expediente;

    document.getElementById("modalAtencion").textContent =
        idAtencion;

    document.getElementById("modalFecha").textContent =
        fecha;

    document.getElementById("modalEstado").textContent =
        estado;


    const medicamentos =
        document.getElementById("medicamentosReceta");

    if (idAtencion === "AT-00142") {
        medicamentos.innerHTML = `
            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Losartán 50 mg
                    </strong>

                    <span>
                        1 tableta cada 12 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        30 días
                    </strong>
                </div>
            </div>

            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Paracetamol 500 mg
                    </strong>

                    <span>
                        1 tableta cada 8 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        5 días
                    </strong>
                </div>
            </div>
        `;

        document.getElementById("modalIndicaciones").textContent =
            "Tomar los medicamentos según las indicaciones establecidas. El paracetamol debe utilizarse únicamente durante el período indicado.";

    } else if (idAtencion === "AT-00139") {
        medicamentos.innerHTML = `
            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Paracetamol 500 mg
                    </strong>

                    <span>
                        1 tableta cada 8 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        5 días
                    </strong>
                </div>
            </div>
        `;

        document.getElementById("modalIndicaciones").textContent =
            "Tomar después de los alimentos y respetar los horarios indicados.";

    } else if (idAtencion === "AT-00135") {
        medicamentos.innerHTML = `
            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Metformina 850 mg
                    </strong>

                    <span>
                        1 tableta cada 12 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        30 días
                    </strong>
                </div>
            </div>
        `;

        document.getElementById("modalIndicaciones").textContent =
            "Tomar durante las comidas y mantener los horarios establecidos.";

    } else if (idAtencion === "AT-00121") {
        medicamentos.innerHTML = `
            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Omeprazol 20 mg
                    </strong>

                    <span>
                        1 cápsula cada 24 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        30 días
                    </strong>
                </div>
            </div>
        `;

        document.getElementById("modalIndicaciones").textContent =
            "Tomar una cápsula antes del desayuno durante el período indicado.";

    } else if (idAtencion === "AT-00098") {
        medicamentos.innerHTML = `
            <div class="medicine-item">
                <div class="medicine-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="medicine-info">
                    <strong>
                        Losartán 50 mg
                    </strong>

                    <span>
                        1 tableta cada 12 horas
                    </span>
                </div>

                <div class="medicine-duration">
                    <span>
                        Duración
                    </span>

                    <strong>
                        30 días
                    </strong>
                </div>
            </div>
        `;

        document.getElementById("modalIndicaciones").textContent =
            "Tomar una tableta cada 12 horas y mantener seguimiento médico.";
    }

    /* ================= ABRIR MODAL ================= */
    document
        .getElementById("recetaModal")
        .classList.add("show");
}

/* ================= CERRAR RECETA ================= */
function cerrarReceta() {
    document
        .getElementById("recetaModal")
        .classList.remove("show");
}

/* ================= CERRAR AL HACER CLIC AFUERA ================= */
document
    .getElementById("recetaModal")
    .addEventListener("click", function(event) {
        if (event.target === this) {
            cerrarReceta();
        }
    });