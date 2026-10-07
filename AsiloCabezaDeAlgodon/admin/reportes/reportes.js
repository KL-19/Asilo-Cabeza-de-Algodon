const API = "http://localhost:5054/api";
let modalAbierto = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("periodoActual").textContent = new Date().getFullYear();
    configurarReportes();
    configurarModales();
    cargarPacientes();
});

function configurarReportes() {
    document.getElementById("abrirCostosCitas").addEventListener("click", () => {
        abrirModal("modalCostosCitas");
    });

    document.getElementById("abrirAnalisisMedicos").addEventListener("click", () => {
        abrirModal("modalAnalisisMedicos");
    });

    document.getElementById("abrirCobrosPaciente").addEventListener("click", () => {
        abrirModal("modalCobrosPaciente");
    });

    document.getElementById("abrirPagosServicios").addEventListener("click", () => {
        abrirModal("modalPagosServicios");
    });

    document.getElementById("abrirDonacionesCobros").addEventListener("click", () => {
        abrirModal("modalDonacionesCobros");
    });

    document.getElementById("abrirExamenesPaciente").addEventListener("click", () => {
        abrirModal("modalExamenesPaciente");
    });

    document.getElementById("abrirMedicamentosPaciente").addEventListener("click", () => {
        abrirModal("modalMedicamentosPaciente");
    });

    document.getElementById("generarCostosCitas").addEventListener("click", generarCostosCitas);
    document.getElementById("generarAnalisisMedicos").addEventListener("click", generarAnalisisMedicos);
    document.getElementById("generarCobrosPaciente").addEventListener("click", generarCobrosPaciente);
    document.getElementById("generarPagosServicios").addEventListener("click", generarPagosServicios);
    document.getElementById("generarDonacionesCobros").addEventListener("click", generarDonacionesCobros);
    document.getElementById("generarExamenesPaciente").addEventListener("click", generarExamenesPaciente);
    document.getElementById("generarMedicamentosPaciente").addEventListener("click", generarMedicamentosPaciente);
}

function configurarModales() {
    const cierres = {
        cerrarModalCostos: "modalCostosCitas",
        cerrarModalAnalisis: "modalAnalisisMedicos",
        cerrarModalCobros: "modalCobrosPaciente",
        cerrarModalPagosServicios: "modalPagosServicios",
        cerrarModalDonaciones: "modalDonacionesCobros",
        cerrarModalExamenes: "modalExamenesPaciente",
        cerrarModalMedicamentos: "modalMedicamentosPaciente"
    };

    Object.entries(cierres).forEach(([botonId, modalId]) => {
        const boton = document.getElementById(botonId);
        if (boton) {
            boton.addEventListener("click", () => cerrarModal(modalId));
        }
    });

    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                cerrarModal(modal.id);
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modalAbierto) {
            cerrarModal(modalAbierto);
        }
    });
}


function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) {
        console.error("No se encontró el modal:", id);
        return;
    }

    document.querySelectorAll(".modal-overlay").forEach(item => {
        item.classList.remove("active");
    });

    modal.classList.add("active");
    modalAbierto = id;
    document.body.classList.add("modal-open");
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
    }
    if (modalAbierto === id) {
        modalAbierto = null;
    }
    document.body.classList.remove("modal-open");
}

async function cargarPacientes() {
    try {
        const response = await fetch(`${API}/Internos`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar los pacientes.");
        }

        const pacientes = await response.json();
        const selects = [
            "pacienteReporte",
            "pacienteAnalisis",
            "pacienteCobros",
            "pacienteExamenes",
            "pacienteMedicamentos"
        ];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) {
                return;
            }
            select.innerHTML = `
                <option value="">
                    Seleccione un paciente
                </option>
            `;
            pacientes.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.id;
                option.textContent = paciente.nombreCompleto || `${paciente.nombre || ""} ${paciente.apellido || ""}`.trim();
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Error al cargar pacientes:", error);
    }
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "—";
    }

    const valor = new Date(fecha);
    if (isNaN(valor.getTime())) {
        return "—";
    }
    return valor.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatearMonto(monto) {
    return Number(monto || 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function obtenerPeriodo(fechaInicio, fechaFin) {
    if (!fechaInicio && !fechaFin) {
        return "Todos los registros";
    }
    if (fechaInicio && fechaFin) {
        return `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`;
    }
    if (fechaInicio) {
        return `Desde ${formatearFecha(fechaInicio)}`;
    }
    return `Hasta ${formatearFecha(fechaFin)}`;
}

function mostrarResultado(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.style.display = "block";
    }
}

function construirParametros(internoId, fechaInicio, fechaFin) {
    const params = new URLSearchParams();
    if (internoId) {
        params.append("internoId", internoId);
    }

    if (fechaInicio) {
        params.append("fechaInicio", fechaInicio);
    }

    if (fechaFin) {
        params.append("fechaFin", fechaFin);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
}

async function generarCostosCitas() {
    const internoId = document.getElementById("pacienteReporte").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!internoId) {
        alert("Seleccione un paciente.");
        return;
    }
    try {
        const query = construirParametros(internoId, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/CostosCitas${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }

        const datos = await response.json();
        const registros = datos.registros || [];
        const tbody = document.getElementById("tablaCostosCitas");
        tbody.innerHTML = "";
        let total = 0;

        registros.forEach(item => {
            const costo = Number(item.montoFinal || 0);
            total += costo;
            const detalles = [];
            if (item.costoConsulta > 0) {
                detalles.push(`Consulta: Q ${formatearMonto(item.costoConsulta)}`);
            }
            if (item.costoExamenes > 0) {
                detalles.push(`Exámenes: Q ${formatearMonto(item.costoExamenes)}`);
            }
            if (item.costoMedicamentos > 0) {
                detalles.push(`Medicamentos: Q ${formatearMonto(item.costoMedicamentos)}`);
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.motivo || "Servicio médico"}</td>
                <td>${formatearFecha(item.fecha)}</td>
                <td>${detalles.length ? detalles.join("<br>") : "—"}</td>
                <td>Q ${formatearMonto(costo)}</td>
            `;
            tbody.appendChild(fila);
        });
        if (registros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay registros para este paciente.
                    </td>
                </tr>
            `;
        }
        const select = document.getElementById("pacienteReporte");
        const nombre = datos.paciente?.nombre || select.options[select.selectedIndex]?.text || "Paciente";
        document.getElementById("nombrePacienteCostos").textContent = nombre;
        document.getElementById("periodoCostos").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("totalCostosCitas").textContent = `Q ${formatearMonto(datos.totalFinal ?? total)}`;
        mostrarResultado("resultadoCostosCitas");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte de costos.");
    }
}

// 2. ANÁLISIS MÉDICOS
async function generarAnalisisMedicos() {
    const internoId = document.getElementById("pacienteAnalisis").value;
    if (!internoId) {
        alert("Seleccione un paciente.");
        return;
    }
    try {
        const response = await fetch(`${API}/Reportes/AnalisisMedico?internoId=${internoId}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }

        const datos = await response.json();
        document.getElementById("listaEvaluaciones").innerHTML = "";
        document.getElementById("listaAtenciones").innerHTML = "";
        document.getElementById("tablaMedicamentosAnalisis").innerHTML = "";
        document.getElementById("analisisNombre").textContent = datos.paciente?.nombre || "—";
        document.getElementById("analisisFechaNacimiento").textContent = formatearFecha(datos.paciente?.fechaNacimiento);
        document.getElementById("analisisFechaIngreso").textContent = formatearFecha(datos.paciente?.fechaIngreso);
        document.getElementById("analisisGenero").textContent = datos.paciente?.genero || "—";

        // EVALUACIONES MEDICAS
        if (datos.evaluaciones?.length) {
            datos.evaluaciones.forEach(evaluacion => {
                document.getElementById("listaEvaluaciones").innerHTML += `
                    <div class="medical-history-item">
                        <strong>${formatearFecha(evaluacion.fecha)}</strong>
                        <span>
                            Motivo: ${evaluacion.motivoConsulta || "—"}
                        </span>
                        <span>
                            Diagnóstico: ${evaluacion.diagnostico || "—"}
                        </span>
                        <span>
                            Observaciones: ${evaluacion.observaciones || "—"}
                        </span>
                    </div>
                `;
            });
        } else {
            document.getElementById("listaEvaluaciones").innerHTML = "<p>No hay evaluaciones médicas registradas.</p>";
        }

        // HISTORIAL DE ATENCIONES
        if (datos.historialAtenciones?.length) {
            datos.historialAtenciones.forEach(cita => {
                if (cita.atenciones?.length) {
                    cita.atenciones.forEach(atencion => {
                        document.getElementById("listaAtenciones").innerHTML += `
                            <div class="medical-history-item">
                                <strong>${formatearFecha(cita.fecha)}</strong>
                                <span>
                                    Motivo: ${cita.motivo || "—"}
                                </span>
                                <span>
                                    Diagnóstico: ${atencion.diagnostico || "—"}
                                </span>
                                <span>
                                    Diagnóstico final: ${atencion.diagnosticoFinal || "—"}
                                </span>
                                <span>
                                    Observaciones: ${atencion.observaciones || "—"}
                                </span>
                            </div>
                        `;
                    });
                }
            });
        } else {
            document.getElementById("listaAtenciones").innerHTML = "<p>No hay atenciones médicas registradas.</p>";
        }

        // MEDICAMENTOS RECETADOS
        if (datos.recetas?.length) {
            datos.recetas.forEach(receta => {
                if (receta.medicamentos?.length) {
                    receta.medicamentos.forEach(medicamento => {
                        document.getElementById("tablaMedicamentosAnalisis").innerHTML += `
                            <div class="medicine-row">
                                <strong>${medicamento.medicamento}</strong>
                                <span>${medicamento.dosis || "—"}</span>
                                <span>${medicamento.frecuencia || "—"}</span>
                                <span>${medicamento.duracion || "—"}</span>
                            </div>
                        `;
                    });
                }
            });
        } else {
            document.getElementById("tablaMedicamentosAnalisis").innerHTML = "<p>No hay medicamentos recetados.</p>";
        }
        mostrarResultado("resultadoAnalisisMedicos");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el análisis médico.");
    }
}

// 3. COBROS POR PACIENTE
async function generarCobrosPaciente() {
    const internoId = document.getElementById("pacienteCobros").value;
    const fechaInicio = document.getElementById("fechaInicioCobros").value;
    const fechaFin = document.getElementById("fechaFinCobros").value;
    if (!internoId) {
        alert("Seleccione un paciente.");
        return;
    }
    try {
        const query = construirParametros(internoId, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/CobrosPaciente${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }
        const datos = await response.json();
        const registros = datos.registros || [];
        
        const tbody = document.getElementById("tablaCobrosPaciente");
        tbody.innerHTML = "";
        let total = 0;
        registros.forEach(item => {
            const monto = Number(item.monto || 0);
            total += monto;
            tbody.innerHTML += `
                <tr>
                    <td>${formatearFecha(item.fecha)}</td>
                    <td>${item.concepto || "—"}</td>
                    <td>${item.tipo || "—"}</td>
                    <td>Q ${formatearMonto(monto)}</td>
                    <td>${item.estado || "—"}</td>
                </tr>
            `;
        });
        if (!registros.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay cobros registrados.
                    </td>
                </tr>
            `;
        }
        const select = document.getElementById("pacienteCobros");
        document.getElementById("nombrePacienteCobros").textContent = datos.paciente?.nombre || select.options[select.selectedIndex]?.text || "Paciente";
        document.getElementById("periodoCobros").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("totalCobrosPaciente").textContent = `Q ${formatearMonto(datos.total ?? total)}`;
        mostrarResultado("resultadoCobrosPaciente");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte de cobros.");
    }
}

// 4. PAGOS DE SERVICIOS MEDICO
async function generarPagosServicios() {
    const fechaInicio = document.getElementById("fechaInicioPagosServicios").value;
    const fechaFin = document.getElementById("fechaFinPagosServicios").value;
    try {
        const query = construirParametros(null, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/PagosServiciosMedicos${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }
        const datos = await response.json();
        const pagos = datos.pagos || [];
        
        const tbody = document.getElementById("tablaPagosServicios");
        tbody.innerHTML = "";
        pagos.forEach(item => {
            const monto = Number(item.monto || 0);
            tbody.innerHTML += `
                <tr>
                    <td>${formatearFecha(item.fechaPago)}</td>
                    <td>${item.paciente || "—"}</td>
                    <td>${item.familiar || "—"}</td>
                    <td>${item.concepto || "—"}</td>
                    <td>Q ${formatearMonto(monto)}</td>
                </tr>
            `;
        });
        if (!pagos.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay pagos registrados.
                    </td>
                </tr>
            `;
        }

        document.getElementById("periodoPagosServicios").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("cantidadPagosServicios").textContent = datos.totalPagos ?? pagos.length;
        document.getElementById("totalRegistrosPagos").textContent = datos.totalPagos ?? pagos.length;
        document.getElementById("montoTotalPagos").textContent = `Q ${formatearMonto(datos.montoTotal)}`;
        mostrarResultado("resultadoPagosServicios");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte de pagos.");
    }
}

// 5. DONACIONES Y COBROS
async function generarDonacionesCobros() {
    const fechaInicio = document.getElementById("fechaInicioDonaciones").value;
    const fechaFin = document.getElementById("fechaFinDonaciones").value;
    try {
        const query = construirParametros(null, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/DonacionesYCobros${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }
        const datos = await response.json();
        const registros = datos.registros || [];
        
        const tbody = document.getElementById("tablaDonacionesCobros");
        tbody.innerHTML = "";
        registros.forEach(item => {
            const monto = Number(item.monto || 0);
            tbody.innerHTML += `
                <tr>
                    <td>${formatearFecha(item.fecha)}</td>
                    <td>${item.tipo || "—"}</td>
                    <td>${item.descripcion || "—"}</td>
                    <td>${item.responsable || "—"}</td>
                    <td>Q ${formatearMonto(monto)}</td>
                </tr>
            `;
        });
        if (!registros.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay entradas económicas registradas.
                    </td>
                </tr>
            `;
        }

        document.getElementById("periodoDonaciones").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("totalDonaciones").textContent = `Q ${formatearMonto(datos.donaciones)}`;
        document.getElementById("totalCobrosEntradas").textContent = `Q ${formatearMonto(datos.cobros)}`;
        document.getElementById("totalEntradas").textContent = `Q ${formatearMonto(datos.totalEntradas)}`;
        document.getElementById("totalEntradasFinal").textContent = `Q ${formatearMonto(datos.totalEntradas)}`;
        mostrarResultado("resultadoDonacionesCobros");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte financiero.");
    }
}

// 6. EXÁMENES MÉDICOS
async function generarExamenesPaciente() {
    const internoId = document.getElementById("pacienteExamenes").value;
    const fechaInicio = document.getElementById("fechaInicioExamenes").value;
    const fechaFin = document.getElementById("fechaFinExamenes").value;
    if (!internoId) {
        alert("Seleccione un paciente.");
        return;
    }
    try {
        const query = construirParametros(internoId, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/ExamenesPaciente${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }
        const datos = await response.json();
        const examenes = datos.examenes || [];
        
        const tbody = document.getElementById("tablaExamenesPaciente");
        tbody.innerHTML = "";
        examenes.forEach(item => {
            const estado = item.estado || "Pendiente";
            tbody.innerHTML += `
                <tr>
                    <td>${formatearFecha(item.fechaSolicitud)}</td>
                    <td>${item.tipoExamen || "—"}</td>
                    <td>${item.indicaciones || "—"}</td>
                    <td>${item.resultado || "Pendiente"}</td>
                    <td>${estado}</td>
                </tr>
            `;
        });
        if (!examenes.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay exámenes registrados.
                    </td>
                </tr>
            `;
        }

        const select = document.getElementById("pacienteExamenes");
        document.getElementById("nombrePacienteExamenes").textContent = datos.paciente?.nombre || select.options[select.selectedIndex]?.text || "Paciente";
        document.getElementById("fechaNacimientoExamenes").textContent = formatearFecha(datos.paciente?.fechaNacimiento);
        document.getElementById("fechaIngresoExamenes").textContent = formatearFecha(datos.paciente?.fechaIngreso);
        document.getElementById("periodoExamenes").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("totalExamenes").textContent = datos.totalExamenes ?? examenes.length;
        document.getElementById("examenesPendientes").textContent =
            datos.pendientes ??
            examenes.filter(e => (e.estado || "").toLowerCase() !== "completado").length;
        mostrarResultado("resultadoExamenesPaciente");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte de exámenes.");
    }
}

// 7. MEDICAMENTOS RECETADOS Y ENTREGADOS
async function generarMedicamentosPaciente() {
    const internoId = document.getElementById("pacienteMedicamentos").value;
    const fechaInicio = document.getElementById("fechaInicioMedicamentos").value;
    const fechaFin = document.getElementById("fechaFinMedicamentos").value;
    if (!internoId) {
        alert("Seleccione un paciente.");
        return;
    }
    try {
        const query = construirParametros(internoId, fechaInicio, fechaFin);
        
        const response = await fetch(`${API}/Reportes/MedicamentosPaciente${query}`);
        if (!response.ok) {
            throw new Error("No se pudo generar el reporte.");
        }
        const datos = await response.json();
        const medicamentos = datos.medicamentos || [];
        
        const tbody = document.getElementById("tablaMedicamentosPaciente");
        tbody.innerHTML = "";
        const medicamentosDiferentes = new Set();
        medicamentos.forEach(item => {
            if (item.medicamento) {
                medicamentosDiferentes.add(item.medicamento);
            }
            tbody.innerHTML += `
                <tr>
                    <td>${formatearFecha(item.fechaReceta)}</td>
                    <td>${item.medicamento || "—"}</td>
                    <td>${item.dosis || "—"}</td>
                    <td>${item.frecuencia || "—"}</td>
                    <td>${item.cantidad ?? "—"}</td>
                    <td>
                        ${
                            item.fechaEntrega
                                ? formatearFecha(item.fechaEntrega)
                                : "Pendiente"
                        }
                    </td>
                </tr>
            `;
        });
        if (!medicamentos.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No hay medicamentos registrados.
                    </td>
                </tr>
            `;
        }

        const select = document.getElementById("pacienteMedicamentos");
        document.getElementById("nombrePacienteMedicamentos").textContent = datos.paciente?.nombre || select.options[select.selectedIndex]?.text || "Paciente";
        document.getElementById("fechaNacimientoMedicamentos").textContent = formatearFecha(datos.paciente?.fechaNacimiento);
        document.getElementById("fechaIngresoMedicamentos").textContent = formatearFecha(datos.paciente?.fechaIngreso);
        document.getElementById("periodoMedicamentos").textContent = obtenerPeriodo(fechaInicio, fechaFin);
        document.getElementById("totalMedicamentos").textContent = datos.totalMedicamentos ?? medicamentos.length;
        document.getElementById("medicamentosDiferentes").textContent =
            datos.medicamentosDiferentes ??
            medicamentosDiferentes.size;
        mostrarResultado("resultadoMedicamentosPaciente");
    } catch (error) {
        console.error(error);
        alert("No se pudo generar el reporte de medicamentos.");
    }
}