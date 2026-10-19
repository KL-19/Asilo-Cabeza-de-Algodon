const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let citaId = null;
let citaActual = null;
let atencionActual = null;
let resultadosLaboratorioActuales = [];

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
    document.getElementById("nombrePaciente").textContent = nombrePaciente;
    document.getElementById("expedientePaciente").textContent = interno?.dpi
            ? `DPI: ${interno.dpi}`
            : `ID interno: ${cita.internoID}`;
    document.getElementById("fechaVisita").textContent = new Date(cita.fechaHora).toLocaleDateString("es-GT");
    document.getElementById("medicoTratante").textContent = cita.especialista?.nombreCompleto || "Médico especialista";
    document.getElementById("especialidadPaciente").textContent = cita?.solicitud?.especialidad?.nombre || "Especialista";
    document.getElementById("motivoVisita").textContent = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
    document.getElementById("enfermeroRefiere").textContent = cita.solicitud?.enfermero?.nombreCompleto || cita.solicitud?.enfermero?.nombreUsuario || "Sin enfermero asignado";
    document.getElementById("descripcionSolicitud").textContent = cita.solicitud?.observaciones || cita.observaciones || "Sin descripción adicional.";
    document.getElementById("historialNombrePaciente").textContent = nombrePaciente;
    document.getElementById("historialExpediente").textContent = interno?.dpi
            ? `DPI: ${interno.dpi}`
            : `ID interno: ${cita.internoID}`;
}

function cargarAtencionExistente() {
    fetch(`${API}/Atenciones/cita/${citaId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo consultar la atención médica.");
            }

            return response.json();
        })
        .then(data => {
            console.log("Respuesta de atención:", data);
            if (!data.existe) {
                prepararPrimeraAtencion();
                return;
            }
            atencionActual = data.atencion;
            prepararAtencionExistente(data.atencion);
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

function prepararPrimeraAtencion() {
    atencionActual = null;
    resultadosLaboratorioActuales = [];
    document.getElementById("diagnostico").value = "";
    document.getElementById("costoConsulta").value = "";
    document.getElementById("observaciones").value = "";
    document.getElementById("diagnosticoFinal").value = "";
    document.getElementById("resultadosLaboratorio").style.display = "none";
    document.getElementById("seccionFinal").style.display = "none";
    document.getElementById("diagnostico").disabled = false;
    document.getElementById("costoConsulta").disabled = false;
    document.getElementById("observaciones").disabled = false;
    document.getElementById("diagnosticoFinal").disabled = false;
}

function prepararAtencionExistente(atencion) {
    console.log("Preparando atención existente:", atencion);
    const diagnostico = document.getElementById("diagnostico");
    const costoConsulta = document.getElementById("costoConsulta");
    const observaciones = document.getElementById("observaciones");
    const diagnosticoFinal = document.getElementById("diagnosticoFinal");
    const seccionPrimera = document.getElementById("seccionPrimeraAtencion");
    const seccionFinal = document.getElementById("seccionFinal");
    const resultados = document.getElementById("resultadosLaboratorio");
    const botonGuardar = document.querySelector(".btn-save");
    const labelObservaciones = document.getElementById("labelObservaciones");

    if (
        atencion.estado === "Completada" || atencion.estado === "Finalizada"
    ) {
        if (seccionPrimera) {
            seccionPrimera.style.display = "block";
        }
        diagnostico.value = atencion.diagnostico || "";
        costoConsulta.value = atencion.costoConsulta ?? "";
        observaciones.value = atencion.observaciones || "";
        diagnosticoFinal.value = atencion.diagnosticoFinal || "";
        diagnostico.disabled = true;
        costoConsulta.disabled = true;
        observaciones.disabled = true;
        diagnosticoFinal.disabled = true;
        if (labelObservaciones) {
            labelObservaciones.textContent = "Observaciones médicas";
        }
        if (botonGuardar) {
            botonGuardar.style.display = "none";
        }
        cargarResultadosLaboratorio(atencion.id, true);
        return;
    }

    /* SEGUNDA ATENCIÓN */
    if (seccionPrimera) {
        seccionPrimera.style.display = "none";
    }

    diagnostico.value = atencion.diagnostico || "";
    costoConsulta.value = atencion.costoConsulta ?? "";
    diagnostico.disabled = true;
    costoConsulta.disabled = true;
    diagnosticoFinal.value = atencion.diagnosticoFinal || "";
    diagnosticoFinal.disabled = false;
    if (seccionFinal) {
        seccionFinal.style.display = "block";
    }
    if (botonGuardar) {
        botonGuardar.style.display = "inline-flex";
        botonGuardar.innerHTML = `
            <i class="ph ph-check"></i>
            Finalizar atención
        `;
    }
    cargarResultadosLaboratorio(atencion.id, false);
}

function cargarResultadosLaboratorio(atencionId, atencionCompletada = false) {
    fetch(`${API}/ResultadosLaboratorio/atencion/${atencionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudieron consultar los resultados.");
            }
            return response.json();
        })
        .then(data => {
            console.log("RESULTADOS DE LABORATORIO RECIBIDOS:", data);
            let resultados = [];
            if (Array.isArray(data)) {
                resultados = data;
            }
            else if (Array.isArray(data.resultados)) {
                resultados = data.resultados;
            }
            else if (Array.isArray(data.resultadosLaboratorio)) {
                resultados = data.resultadosLaboratorio;
            }
            else if (Array.isArray(data.data)) {
                resultados = data.data;
            }
            resultadosLaboratorioActuales = resultados;
            const seccionResultados = document.getElementById("resultadosLaboratorio");
            const seccionFinal = document.getElementById("seccionFinal");
            const diagnosticoFinal = document.getElementById("diagnosticoFinal");
            console.log("Resultados encontrados:", resultados.length);
            if (resultados.length === 0) {
                seccionResultados.style.display = "none";
                if (!atencionCompletada) {
                    seccionFinal.style.display = "none";
                }
                return;
            }

            // Mostrar resultados
            mostrarResultadosLaboratorio(resultados);
            seccionResultados.style.display = "block";
            if (!atencionCompletada) {
                seccionFinal.style.display = "block";
                diagnosticoFinal.disabled = false;
            }
            else {
                seccionFinal.style.display = "block";
                diagnosticoFinal.disabled = true;
            }
        })
        .catch(error => {
            console.error("ERROR AL CARGAR RESULTADOS:", error);
            document.getElementById("resultadosLaboratorio").style.display = "none";
        });
}

function mostrarResultadosLaboratorio(resultados) {
    const container = document.getElementById("labResultsContent");
    container.innerHTML = "";
    resultados.forEach(resultado => {
        const div = document.createElement("div");
        div.className = "lab-result-item";
        div.innerHTML = `
            <div class="lab-result-header">
                <strong>
                    ${
                        resultado.examenLaboratorio?.tipoExamen || "Examen de laboratorio"
                    }
                </strong>

                <span>
                    ${
                        resultado.fechaResultado
                            ? new Date(
                                  resultado.fechaResultado
                              ).toLocaleDateString("es-GT")
                            : ""
                    }
                </span>
            </div>

            <div class="lab-result-body">
                <p>
                    <strong>Resultado:</strong>
                    ${resultado.resultado || "Sin resultado"}
                </p>

                <p>
                    <strong>Observaciones:</strong>
                    ${
                        resultado.observaciones || "Sin observaciones"
                    }
                </p>
            </div>
        `;
        container.appendChild(div);
    });
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
    guardarPrimeraAtencion();
}

function guardarPrimeraAtencion() {
    const diagnostico = document.getElementById("diagnostico").value.trim();
    const costo = document.getElementById("costoConsulta").value;
    const observaciones = document.getElementById("observaciones").value.trim();
    if (!diagnostico) {
        alert("Debe ingresar el diagnóstico.");
        return;
    }

    if (!costo) {
        alert("Debe ingresar el costo de la consulta.");
        return;
    }
    const examenes = obtenerExamenes();
    const medicamentos = obtenerMedicamentos();
    const estado = examenes.length > 0
            ? "Pendiente resultados"
            : "Completada";
    const datos = {
        citaID: parseInt(citaId),
        diagnostico: diagnostico,
        observaciones: observaciones || null,
        costoConsulta: parseFloat(costo),
        estado: estado
    };
    console.log("Enviando primera atención:", datos);

    fetch(`${API}/Atenciones`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(
                        error.mensaje || "No se pudo guardar la atención."
                    );
                });
            }
            return response.json();
        })
        .then(atencion => {
            atencionActual = atencion;

            return guardarExamenes(
                atencion.id,
                examenes
            ).then(() => {
                return guardarMedicamentos(
                    atencion.id,
                    medicamentos
                );
            }).then(() => atencion);
        })
        .then(atencion => {
            console.log("Todo guardado:", atencion);
            if (estado === "Pendiente resultados") {
                alert("La atención fue guardada y quedó pendiente de resultados de laboratorio.");
            } else {
                alert("La atención médica se guardó correctamente.");
            }
            window.location.href = "../MisCitas/misCitas.html";
        })
        .catch(error => {
            console.error("ERROR AL GUARDAR:", error);
            alert(error.message);
        });
}

function obtenerExamenes() {
    const elementos = document.querySelectorAll(".examen-item");
    const examenes = [];
    elementos.forEach(elemento => {
        const tipo = elemento.querySelector(".input-examen")?.value.trim();
        const indicaciones = elemento.querySelector(".input-indicaciones")?.value.trim();
        if (tipo) {
            examenes.push({
                tipoExamen: tipo, indicaciones: indicaciones || null
            });
        }
    });
    return examenes;
}

function guardarExamenes(atencionId, examenes) {
    if (!examenes || examenes.length === 0) {
        return Promise.resolve();
    }
    const promesas = examenes.map(examen => {
        const datos = {
            atencionMedicaID: atencionId,
            tipoExamen: examen.tipoExamen,
            indicaciones: examen.indicaciones
        };

        return fetch(`${API}/ExamenesLaboratorio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(
                            error.mensaje ||
                            "No se pudo guardar un examen."
                        );
                    });
                }
                return response.json();
            });
    });
    return Promise.all(promesas);
}

function obtenerMedicamentos() {
    const elementos = document.querySelectorAll(".medicamento-item");
    const medicamentos = [];
    elementos.forEach(elemento => {
        const medicamento = elemento.querySelector(".input-medicamento")?.value.trim();
        const dosis = elemento.querySelector(".input-dosis")?.value.trim();
        const frecuencia = elemento.querySelector(".input-frecuencia")?.value.trim();
        const duracion = elemento.querySelector(".input-duracion")?.value.trim();
        const cantidad = elemento.querySelector(".input-cantidad")?.value;
        const indicaciones = elemento
                .querySelector(".input-indicaciones-medicamento")
                ?.value.trim();
        if (medicamento) {
            medicamentos.push({
                medicamento: medicamento,
                dosis: dosis || null,
                frecuencia: frecuencia || null,
                duracion: duracion || null,
                cantidad: cantidad
                    ? parseInt(cantidad)
                    : null,
                indicaciones: indicaciones || null
            });
        }
    });
    return medicamentos;
}

function guardarMedicamentos(atencionId, medicamentos) {
    if (!medicamentos || medicamentos.length === 0) {
        return Promise.resolve();
    }
    const datosReceta = {
        atencionMedicaID: atencionId,
        indicacionesGenerales: null,
        estado: "Pendiente"
    };

    return fetch(`${API}/Recetas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosReceta)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(
                        error.mensaje ||
                        "No se pudo crear la receta."
                    );
                });
            }
            return response.json();
        })
        .then(receta => {
            const promesas = medicamentos.map(medicamento => {
                const datos = {
                    recetaID: receta.id,
                    medicamento: medicamento.medicamento,
                    dosis: medicamento.dosis,
                    frecuencia: medicamento.frecuencia,
                    duracion: medicamento.duracion,
                    cantidad: medicamento.cantidad,
                    indicaciones: medicamento.indicaciones
                };

                return fetch(`${API}/DetalleReceta`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datos)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(error => {
                                throw new Error(
                                    error.mensaje || "No se pudo guardar un medicamento."
                                );
                            });
                        }
                        return response.json();
                    });
            });
            return Promise.all(promesas);
        });
}

function guardarSegundaAtencion() {
    if (!atencionActual) {
        alert("No existe una atención para actualizar.");
        return;
    }

    if (resultadosLaboratorioActuales.length === 0) {
        alert("La atención todavía está pendiente de resultados de laboratorio.");
        return;
    }
    const diagnosticoFinal = document.getElementById("diagnosticoFinal").value.trim();
    const datos = {
        diagnosticoFinal: diagnosticoFinal,
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
                return response.json().then(error => {
                    throw new Error(
                        error.mensaje || "No se pudo finalizar la atención."
                    );
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Atención finalizada:", data);
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
    const button = document.getElementById("btnExamenes");
    content.classList.toggle("open");
    button.classList.toggle("active");
}

function toggleMedicamentos() {
    const content = document.getElementById("medicamentosContent");
    const button = document.getElementById("btnMedicamentos");
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

async function cargarHistorial() {
    const internoId = citaActual?.internoID;
    const container = document.getElementById("historialContenido");
    if (!internoId) {
        container.innerHTML = "<p>No se encontró el paciente.</p>";
        return;
    }
    container.innerHTML ="<p>Cargando historial médico...</p>";
    try {
        const response =
            await fetch(
                `${API}/Atenciones/interno/${internoId}`
            );
        if (!response.ok) {
            throw new Error("No se pudo cargar el historial.");
        }

        const atenciones =await response.json();
        if (!atenciones || atenciones.length === 0) {
            container.innerHTML = `
                <p>
                    No existen atenciones médicas anteriores.
                </p>
            `;
            return;
        }

        const historialCompleto =
            await Promise.all(
                atenciones.map(async atencion => {
                    const [examenes, resultados, receta] =
                        await Promise.all([
                            obtenerDatosHistorial(
                                "ExamenesLaboratorio",
                                `atencion/${atencion.id}`
                            ),
                            obtenerDatosHistorial(
                                "ResultadosLaboratorio",
                                `atencion/${atencion.id}`
                            ),
                            obtenerDatosHistorial(
                                "Recetas",
                                `atencion/${atencion.id}`
                            )
                        ]);
                    let detallesReceta = [];
                    if (
                        receta &&
                        receta.existe &&
                        receta.receta
                    ) {
                        detallesReceta = await obtenerDatosHistorial(
                                "DetalleReceta",
                                `receta/${receta.receta.id}`
                            );
                    }
                    return {
                        atencion,
                        examenes: examenes || [],
                        resultados: resultados || [],
                        receta,
                        detallesReceta: detallesReceta || []
                    };
                })
            );
        mostrarHistorial(historialCompleto);
    }
    catch (error) {
        console.error(
            "ERROR AL CARGAR HISTORIAL:",
            error
        );
        container.innerHTML = `
            <p>
                No se pudo cargar el historial médico.
            </p>
        `;
    }
}

async function obtenerDatosHistorial(controlador, ruta) {
    try {
        const response =
            await fetch(
                `${API}/${controlador}/${ruta}`
            );
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        }
        return data;
    }
    catch (error) {
        console.error(
            `Error consultando ${controlador}:`,
            error
        );

        return [];
    }
}

function mostrarHistorial(historial) {
    const container = document.getElementById("historialContenido");
    container.innerHTML = "";
    historial.forEach(item => {
        const atencion =
            item.atencion;

        const div = document.createElement("div");
        div.className = "history-item";
        const fecha =
            atencion.fechaAtencion
                ? new Date(
                      atencion.fechaAtencion
                  ).toLocaleDateString("es-GT")
                : "Sin fecha";
        const diagnostico = atencion.diagnosticoFinal || atencion.diagnostico || "Sin diagnóstico";
        let examenesHTML = "";
        if (
            item.examenes && item.examenes.length > 0
        ) {
            examenesHTML = `
                <div class="history-section">
                    <strong>Exámenes solicitados:</strong>
                    <ul>
                        ${item.examenes
                            .map(examen => `
                                <li>
                                    ${examen.tipoExamen}
                                </li>
                            `)
                            .join("")}
                    </ul>
                </div>
            `;
        }
        let resultadosHTML = "";
        if (
            item.resultados && item.resultados.length > 0
        ) {
            resultadosHTML = `
                <div class="history-section">
                    <strong>Resultados de laboratorio:</strong>
                    ${item.resultados
                        .map(resultado => `
                            <p>
                                <strong>
                                    ${
                                        resultado
                                            .examenLaboratorio
                                            ?.tipoExamen ||
                                        "Examen"
                                    }:
                                </strong>

                                ${
                                    resultado.resultado || "Sin resultado"
                                }
                            </p>

                            <p>
                                <strong>Observaciones:</strong>
                                ${
                                    resultado.observaciones || "Sin observaciones"
                                }
                            </p>
                        `)
                        .join("")}
                </div>
            `;
        }
        let medicamentosHTML = "";
        if (
            item.detallesReceta && item.detallesReceta.length > 0
        ) {
            medicamentosHTML = `
                <div class="history-section">
                    <strong>Medicamentos:</strong>

                    <ul>
                        ${item.detallesReceta
                            .map(medicamento => `
                                <li>
                                    <strong>
                                        ${medicamento.medicamento}
                                    </strong>

                                    ${
                                        medicamento.dosis
                                            ? ` - ${medicamento.dosis}`
                                            : ""
                                    }

                                    ${
                                        medicamento.frecuencia
                                            ? ` - ${medicamento.frecuencia}`
                                            : ""
                                    }

                                    ${
                                        medicamento.duracion
                                            ? ` - ${medicamento.duracion}`
                                            : ""
                                    }
                                </li>
                            `)
                            .join("")}
                    </ul>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="history-header">
                <strong>${fecha}</strong>
                <span>${diagnostico}</span>
            </div>

            <div class="history-body">
                <p>
                    <strong>Observaciones:</strong>
                    ${
                        atencion.observaciones ||
                        "Sin observaciones"
                    }
                </p>
                ${examenesHTML}
                ${resultadosHTML}
                ${medicamentosHTML}
            </div>
        `;
        container.appendChild(div);
    });
}

function inicializarModalHistorial() {
    const modal = document.getElementById("modalHistorial");
    if (!modal) {
        return;
    }

    modal.addEventListener(
        "click",
        function(event) {
            if (event.target === this) {
                cerrarHistorial();
            }
        }
    );
}