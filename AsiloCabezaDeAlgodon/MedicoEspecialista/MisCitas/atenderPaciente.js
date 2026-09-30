const API = "http://localhost:5054/api";
let citaId = null;
let citaActual = null;
let atencionActual = null;

document.addEventListener("DOMContentLoaded", () => {
    obtenerCitaId();
    if (!citaId) {
        alert("No se encontró la cita.");
        return;
    }
    cargarCita();
    inicializarModalHistorial();
});

function obtenerCitaId() {
    const parametros = new URLSearchParams(window.location.search);
    citaId = parametros.get("id");
}

function cargarCita() {
    fetch(`${API}/Citas/${citaId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar la cita.");
            }
            return response.json();
        })
        .then(cita => {
            console.log("Cita cargada:", cita);
            citaActual = cita;
            llenarInformacionCita(cita);
            cargarAtencionExistente();
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

function llenarInformacionCita(cita) {
    const interno = cita.interno;
    const nombrePaciente = interno
        ? `${interno.nombre} ${interno.apellido}`
        : "Paciente";
    document.getElementById("nombrePacien").textContent = nombrePaciente;
    document.getElementById("expedientePaciente").textContent = interno?.dpi
        ? `DPI: ${interno.dpi}`
        : `ID interno: ${cita.internoID}`;
    document.getElementById("fechaVisita").textContent =new Date(cita.fechaHora).toLocaleDateString("es-GT");
    document.getElementById("medicoTratante").textContent = cita.especialista?.nombreCompleto || "Médico especialista";
    document.getElementById("especialidadPaciente").textContent = cita.especialista?.perfilUsuario?.especialidad?.nombre || "Especialista";
    document.getElementById("motivoVisita").textContent = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
    document.getElementById("enfermeroRefiere").textContent = cita.solicitud?.enfermero?.nombreCompleto || cita.solicitud?.enfermero?.nombreUsuario || "Sin enfermero asignado";
    document.getElementById("descripcionSolicitud").textContent = cita.solicitud?.observaciones || cita.observaciones || "Sin descripción adicional.";
    document.getElementById("historialNombrePaciente").textContent = nombrePaciente;
    document.getElementById("historialExpediente").textContent =
        interno?.dpi
            ? `DPI: ${interno.dpi}`
            : `ID interno: ${cita.internoID}`;
}

function cargarAtencionExistente() {
    fetch(`${API}/Atenciones/cita/${citaId}`)
        .then(response => {
            if (response.status === 404) {
                prepararPrimeraAtencion();
                return null;
            }

            if (!response.ok) {
                throw new Error("No se pudo consultar la atención médica.");
            }

            return response.json();
        })
        .then(atencion => {
            if (!atencion) {
                return;
            }

            console.log("Atención existente:", atencion);
            atencionActual = atencion;
            prepararAtencionExistente(atencion);
        })
        .catch(error => {
            console.error(error);
        });
}

function prepararPrimeraAtencion() {
    atencionActual = null;

    document.getElementById("diagnostico").value = "";
    document.getElementById("costoConsulta").value = "";
    document.getElementById("observaciones").value = "";
    document.getElementById("diagnosticoFinal").value = "";
    document.getElementById("resultadosLaboratorio").style.display = "none";
    document.getElementById("seccionFinal").style.display = "none";
    document.getElementById("diagnostico").disabled = false;
    document.getElementById("costoConsulta").disabled = false;
    document.getElementById("observaciones").disabled = false;
}

function prepararAtencionExistente(atencion) {
    document.getElementById("diagnostico").value =atencion.diagnostico || "";
    document.getElementById("costoConsulta").value =atencion.costoConsulta || "";
    document.getElementById("observaciones").value =atencion.observaciones || "";
    if (
        atencion.estado === "Completada" || atencion.estado === "Finalizada"
    ) {
        document.getElementById("diagnostico").disabled = true;
        document.getElementById("costoConsulta").disabled = true;
        document.getElementById("diagnosticoFinal").value = atencion.diagnosticoFinal || "";
        document.getElementById("seccionFinal").style.display = "block";
        return;
    }
}

function guardarVisita() {
    if (!citaId) {
        alert("No se encontró la cita.");
        return;
    }

    if (atencionActual) {
        guardarSegundaAtencion();
        return;
    }

    const diagnostico = document.getElementById("diagnostico").value.trim();
    const costo =document.getElementById("costoConsulta").value;
    const observaciones = document.getElementById("observaciones").value.trim();
    if (!diagnostico) {
        alert("Debe ingresar el diagnóstico.");
        return;
    }

    if (!costo) {
        alert("Debe ingresar el costo de la consulta.");
        return;
    }

    const datos = {
        citaID: parseInt(citaId),
        diagnostico: diagnostico,
        observaciones: observaciones || null,
        costoConsulta: parseFloat(costo),
        estado: "Completada"
    };

    console.log("Enviando atención:", datos);

    fetch(`${API}/Atenciones`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) {
                return response.json()
                    .then(error => {
                        throw new Error(
                            error.mensaje ||
                            "No se pudo guardar la atención."
                        );
                    });
            }

            return response.json();
        })
        .then(atencion => {
            console.log("Atención guardada:", atencion);

            alert("La atención médica se guardó correctamente.");

            window.location.href = "../MisCitas/misCitas.html";
        })
        .catch(error => {
            console.error("ERROR AL GUARDAR:", error);
            alert(error.message);
        });
}

function guardarSegundaAtencion() {
    if (!atencionActual) {
        alert("No existe una atención para actualizar.");
        return;
    }

    const diagnosticoFinal = document.getElementById("diagnosticoFinal").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();
    if (!diagnosticoFinal) {
        alert("Debe ingresar el diagnóstico final.");
        return;
    }

    const datos = {
        diagnosticoFinal: diagnosticoFinal,
        observaciones: observaciones || null,
        estado: "Completada"
    };

    fetch(`${API}/Atenciones/${atencionActual.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo finalizar la atención.");
            }

            return response.json();
        })
        .then(() => {
            alert("La atención médica fue finalizada correctamente.");
            window.location.href = "../MisCitas/misCitas.html";
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

function agregarExamen() {
    const container = document.getElementById("examenesContainer");
    const div = document.createElement("div");
    div.className = "dynamic-item examen-item";
    div.innerHTML = `
        <input
            type="text"
            class="input-examen"
            placeholder="Tipo de examen"
        >
        <input
            type="text"
            class="input-indicaciones"
            placeholder="Indicaciones"
        >
        <button
            type="button"
            onclick="this.parentElement.remove()"
            class="btn-remove"
        >
            <i class="ph ph-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function agregarMedicamento() {
    const container = document.getElementById("medicamentosContainer");
    const div = document.createElement("div");
    div.className = "dynamic-item medicamento-item";
    div.innerHTML = `
        <input
            type="text"
            class="input-medicamento"
            placeholder="Medicamento"
        >
        <input
            type="text"
            class="input-dosis"
            placeholder="Dosis"
        >
        <input
            type="text"
            class="input-frecuencia"
            placeholder="Frecuencia"
        >
        <input
            type="text"
            class="input-duracion"
            placeholder="Duración"
        >
        <input
            type="number"
            class="input-cantidad"
            placeholder="Cantidad"
            min="1"
        >
        <input
            type="text"
            class="input-indicaciones-medicamento"
            placeholder="Indicaciones"
        >
        <button
            type="button"
            onclick="this.parentElement.remove()"
            class="btn-remove"
        >
            <i class="ph ph-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function toggleExamenes() {
    const content = document.getElementById("examenesContent");
    const button =document.getElementById("btnExamenes");
    content.classList.toggle("open");
    button.classList.toggle("active");
}

function toggleMedicamentos() {
    const content =document.getElementById("medicamentosContent");
    const button =document.getElementById("btnMedicamentos");
    content.classList.toggle("open");
    button.classList.toggle("active");
}

function cancelarAtencion() {
    window.location.href = "../MisCitas/misCitas.html";
}

function abrirHistorial() {
    document.getElementById("modalHistorial").classList.add("active");
    cargarHistorial();
}

function cerrarHistorial() {
    document.getElementById("modalHistorial").classList.remove("active");
}

function cargarHistorial() {
    const internoId = citaActual?.internoID;
    const container =document.getElementById("historialContenido");
    if (!internoId) {
        container.innerHTML =
            "<p>No se encontró el paciente.</p>";
        return;
    }

    container.innerHTML =
        "<p>Cargando historial...</p>";

    fetch(`${API}/Atenciones/interno/${internoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    "No se pudo cargar el historial."
                );
            }

            return response.json();
        })
        .then(atenciones => {
            mostrarHistorial(atenciones);
        })
        .catch(error => {
            console.error(error);
            container.innerHTML = `
                <p>
                    No se pudo cargar el historial médico.
                </p>
            `;
        });
}

function mostrarHistorial(atenciones) {
    const container =document.getElementById("historialContenido");
    container.innerHTML = "";

    if (!atenciones || atenciones.length === 0) {
        container.innerHTML = `
            <p>
                No existen atenciones médicas anteriores.
            </p>
        `;
        return;
    }

    atenciones.forEach(atencion => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <div>
                <strong>
                    ${
                        new Date(
                            atencion.fechaAtencion
                        ).toLocaleDateString("es-GT")
                    }
                </strong>
                <span>
                    ${
                        atencion.diagnosticoFinal ||
                        atencion.diagnostico ||
                        "Sin diagnóstico"
                    }
                </span>
            </div>
            <p>
                ${
                    atencion.observaciones ||
                    "Sin observaciones"
                }
            </p>
        `;

        container.appendChild(div);
    });
}

function inicializarModalHistorial() {
    const modal = document.getElementById("modalHistorial");
    if (!modal) {
        return;
    }

    modal.addEventListener("click", function(event) {
        if (event.target === this) {
            cerrarHistorial();
        }
    });
}