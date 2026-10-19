const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let modalAbierto = null;
let reporteCostosActual = null;
let reporteAnalisisActual = null;
let reporteCobrosActual = null;
let reportePagosActual = null;
let reporteDonacionesActual = null;
let reporteExamenesActual = null;
let reporteMedicamentosActual = null;

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

    document.getElementById("pdfCostosCitas").addEventListener("click", descargarPDFCostosCitas);
    document.getElementById("pdfAnalisisMedicos").addEventListener("click", descargarPDFAnalisisMedicos);
    document.getElementById("pdfCobrosPaciente").addEventListener("click", descargarPDFCobrosPaciente);
    document.getElementById("pdfPagosServicios").addEventListener("click", descargarPDFPagosServicios);
    document.getElementById("pdfDonacionesCobros").addEventListener("click", descargarPDFDonacionesCobros);
    document.getElementById("pdfExamenesPaciente").addEventListener("click", descargarPDFExamenesPaciente);
    document.getElementById("pdfMedicamentosPaciente").addEventListener("click", descargarPDFMedicamentosPaciente);
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
        
        const selects = ["pacienteReporte", "pacienteAnalisis", "pacienteCobros", "pacienteExamenes", "pacienteMedicamentos"];
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
        reporteCostosActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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
        reporteAnalisisActual = datos;

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
        reporteCobrosActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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
        reportePagosActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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
        reporteDonacionesActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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
        reporteExamenesActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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
        reporteMedicamentosActual = {
            datos,
            fechaInicio,
            fechaFin
        };
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

// FUNCIONES GENERALES PARA PDF
function crearDocumentoPDF(titulo, orientacion = "portrait") {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("No se pudo cargar la librería para generar el PDF.");
        return null;
    }
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: orientacion,
        unit: "mm",
        format: "a4"
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Cabeza de Algodón", 14, 18);

    doc.setFontSize(13);
    doc.text(titulo, 14, 27);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(`Fecha de generación: ${formatearFecha(new Date())}`, 14, 34);
    return doc;
}

function agregarPiePDF(doc) {
    const paginas = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina++) {
        doc.setPage(pagina);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
            `Página ${pagina} de ${paginas}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 8,
            {
                align: "right"
            }
        );
    }
}

function guardarPDF(doc, nombreArchivo) {
    agregarPiePDF(doc);
    doc.save(`${nombreArchivo}.pdf`);
}

function limpiarNombreArchivo(nombre) {
    return String(nombre || "reporte").replace(/[\\/:*?"<>|]/g, "").trim().replace(/\s+/g, "_");
}

function validarTablaPDF(doc) {
    if (!doc.autoTable) {
        alert("No se pudo cargar la libreria para generar las tablas del PDF.");
        return false;
    }
    return true;
}

function agregarInformacionPacientePDF(doc, nombre, periodo, inicioY = 43) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Paciente:", 14, inicioY);
    doc.setFont("helvetica", "normal");
    doc.text(String(nombre || "—"), 35, inicioY);
    doc.setFont("helvetica", "bold");
    doc.text("Período:", 14, inicioY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(String(periodo || "Todos los registros"), 35, inicioY + 6);
    return inicioY + 14;
}

// PDF 1 COSTOS DE CITAS
function descargarPDFCostosCitas() {
    if (!reporteCostosActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reporteCostosActual;
    
    const doc = crearDocumentoPDF("Costos de citas por paciente");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const registros = datos.registros || [];
    const nombre = datos.paciente?.nombre || document.getElementById("pacienteReporte").options[document.getElementById("pacienteReporte").selectedIndex]?.text || "Paciente";
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    let posicionY = agregarInformacionPacientePDF(doc, nombre, periodo);
    const filas = registros.map(item => {
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
        return [item.motivo || "Servicio médico", formatearFecha(item.fecha), detalles.length ? detalles.join("\n") : "-", `Q ${formatearMonto(item.montoFinal)}`];
    });

    if (!filas.length) {
        filas.push(["-", "-", "No hay registros para este paciente.", "Q 0.00" ]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Concepto", "Fecha", "Detalle", "Costo"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });

    const total =
        datos.totalFinal ??
        registros.reduce((sum, item) => sum + Number(item.montoFinal || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de costos: Q ${formatearMonto(total)}`, 14, finalY);
    guardarPDF(doc, `Costos_Citas_${limpiarNombreArchivo(nombre)}`);
}

// PDF 2. ANALISIS MEDICO
function descargarPDFAnalisisMedicos() {
    if (!reporteAnalisisActual) {
        alert("Primero debe generar el reporte.");
        return;
    }

    const datos = reporteAnalisisActual;
    const doc = crearDocumentoPDF("Análisis médicos por paciente", "landscape");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const paciente = datos.paciente || {};
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Información del paciente", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Nombre: ${paciente.nombre || "—"}`, 14, 52);
    doc.text(`Fecha de nacimiento: ${formatearFecha(paciente.fechaNacimiento)}`, 14, 58);
    doc.text(`Fecha de ingreso: ${formatearFecha(paciente.fechaIngreso)}`, 14, 64);
    doc.text(`Género: ${paciente.genero || "—"}`, 14, 70);
    let posicionY = 80;

    // EVALUACIONES
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Evaluaciones médicas", 14, posicionY);
    posicionY += 4;
    const evaluaciones = datos.evaluaciones || [];

    const filasEvaluaciones = evaluaciones.map(evaluacion => [formatearFecha(evaluacion.fecha), evaluacion.motivoConsulta || "-", evaluacion.diagnostico || "-", evaluacion.observaciones || "-"]);
    if (!filasEvaluaciones.length) {
        filasEvaluaciones.push(["-", "No hay evaluaciones médicas registradas.", "-", "-"]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Motivo", "Diagnóstico", "Observaciones"]],
        body: filasEvaluaciones,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    posicionY = doc.lastAutoTable.finalY + 10;

    // ATENCIONES
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Historial de atenciones médicas", 14, posicionY);
    posicionY += 4;

    const filasAtenciones = [];
    (datos.historialAtenciones || []).forEach(cita => {
        (cita.atenciones || []).forEach(atencion => {
            filasAtenciones.push([formatearFecha(cita.fecha), cita.motivo || "-", atencion.diagnostico || "-", atencion.diagnosticoFinal || "-", atencion.observaciones || "-"]);
        });
    });
    if (!filasAtenciones.length) {
        filasAtenciones.push(["-", "No hay atenciones médicas registradas.", "-", "-", "-"]);
    }
    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Motivo", "Diagnóstico", "Diagnóstico final", "Observaciones"]],
        body: filasAtenciones,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    posicionY = doc.lastAutoTable.finalY + 10;

    // MEDICAMENTOS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Medicamentos recetados", 14, posicionY);
    posicionY += 4;

    const filasMedicamentos = [];
    (datos.recetas || []).forEach(receta => {
        (receta.medicamentos || []).forEach(medicamento => {
            filasMedicamentos.push([medicamento.medicamento || "-", medicamento.dosis || "-", medicamento.frecuencia || "-", medicamento.duracion || "-"]);
        });
    });

    if (!filasMedicamentos.length) {
        filasMedicamentos.push(["No hay medicamentos recetados.", "-", "-", "-"]);
    }
    doc.autoTable({
        startY: posicionY,
        head: [["Medicamento", "Dosis", "Frecuencia", "Duración"]],
        body: filasMedicamentos,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    guardarPDF(doc, `Analisis_Medico_${limpiarNombreArchivo(paciente.nombre)}`);
}

// PDF 3 COBROS POR PACIENTE
function descargarPDFCobrosPaciente() {
    if (!reporteCobrosActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reporteCobrosActual;
    
    const doc = crearDocumentoPDF("Cobros por paciente");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const registros = datos.registros || [];
    const nombre = datos.paciente?.nombre || document.getElementById("pacienteCobros").options[document.getElementById("pacienteCobros").selectedIndex]?.text || "Paciente";
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    const posicionY = agregarInformacionPacientePDF(doc, nombre, periodo);
    
    const filas = registros.map(item => [formatearFecha(item.fecha), item.concepto || "-", item.tipo || "-", `Q ${formatearMonto(item.monto)}`, item.estado || "-"]);
    if (!filas.length) {
        filas.push(["-", "No hay cobros registrados.", "-", "Q 0.00", "-"]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Concepto", "Tipo", "Monto", "Estado"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    const total = datos.total ??
        registros.reduce((sum, item) => sum + Number(item.monto || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de cobros: Q ${formatearMonto(total)}`, 14, finalY);
    guardarPDF(doc, `Cobros_${limpiarNombreArchivo(nombre)}`);
}

// PDF 4 PAGOS DE SERVICIOS MEDICOS
function descargarPDFPagosServicios() {
    if (!reportePagosActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reportePagosActual;
    
    const doc = crearDocumentoPDF("Pagos de servicios médicos");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const pagos = datos.pagos || [];
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    const posicionY = agregarInformacionPacientePDF(doc, "Todos los pacientes", periodo);

    const filas = pagos.map(item => [formatearFecha(item.fechaPago), item.paciente || "-", item.familiar || "-", item.concepto || "-", `Q ${formatearMonto(item.monto)}`]);
    if (!filas.length) {
        filas.push(["-", "No hay pagos registrados.", "-", "-", "Q 0.00"]);
    }
    doc.autoTable({
        startY: posicionY,
        head: [["Fecha de pago", "Paciente", "Familiar", "Concepto", "Monto"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de pagos: ${datos.totalPagos ?? pagos.length}`,14, finalY);
    doc.text(`Monto total pagado: Q ${formatearMonto(datos.montoTotal)}`, 14, finalY + 6);
    guardarPDF(doc, "Pagos_Servicios_Medicos");
}

// PDF 5 DONACIONES Y COBROS
function descargarPDFDonacionesCobros() {
    if (!reporteDonacionesActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reporteDonacionesActual;

    const doc = crearDocumentoPDF("Entradas de donaciones y cobros");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const registros = datos.registros || [];
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    const posicionY = agregarInformacionPacientePDF(doc, "Fundación Cabeza de Algodón", periodo);

    const filas = registros.map(item => [formatearFecha(item.fecha), item.tipo || "-", item.descripcion || "-", item.responsable || "-", `Q ${formatearMonto(item.monto)}`]);
    if (!filas.length) {
        filas.push(["-", "-", "No hay entradas económicas registradas.", "-", "Q 0.00"]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Tipo", "Descripción", "Responsable", "Monto"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de donaciones: Q ${formatearMonto(datos.donaciones)}`, 14, finalY);
    doc.text(`Total de cobros: Q ${formatearMonto(datos.cobros)}`, 14, finalY + 6);
    doc.text(`Total de entradas: Q ${formatearMonto(datos.totalEntradas)}`, 14, finalY + 12);
    guardarPDF(doc, "Entradas_Donaciones_Cobros");
}

// PDF 6 EXAMENES MEDICOS
function descargarPDFExamenesPaciente() {
    if (!reporteExamenesActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reporteExamenesActual;

    const doc = crearDocumentoPDF("Exámenes médicos por paciente");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const examenes = datos.examenes || [];
    const nombre = datos.paciente?.nombre || document.getElementById("pacienteExamenes").options[document.getElementById("pacienteExamenes").selectedIndex]?.text || "Paciente";
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    let posicionY = agregarInformacionPacientePDF(doc, nombre, periodo);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha de nacimiento: ${formatearFecha(datos.paciente?.fechaNacimiento)}`, 14, posicionY);
    doc.text(`Fecha de ingreso: ${formatearFecha(datos.paciente?.fechaIngreso)}`, 14, posicionY + 6);
    posicionY += 14;

    const filas = examenes.map(item => [formatearFecha(item.fechaSolicitud), item.tipoExamen || "-", item.indicaciones || "-", item.resultado || "Pendiente", item.estado || "Pendiente"]);
    if (!filas.length) {
        filas.push(["-", "No hay exámenes registrados.", "-", "Pendiente", "Pendiente"]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Examen", "Indicaciones", "Resultado", "Estado"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de exámenes: ${datos.totalExamenes ?? examenes.length}`, 14, finalY);
    doc.text( `Exámenes pendientes: ${
            datos.pendientes ??
            examenes.filter(e => (e.estado || "").toLowerCase() !== "completado").length
        }`, 14, finalY + 6);
    guardarPDF(doc, `Examenes_Medicos_${limpiarNombreArchivo(nombre)}`);
}

// PDF 7 MEDICAMENTOS RECETADOS Y ENTREGADOS
function descargarPDFMedicamentosPaciente() {
    if (!reporteMedicamentosActual) {
        alert("Primero debe generar el reporte.");
        return;
    }
    const { datos, fechaInicio, fechaFin } = reporteMedicamentosActual;

    const doc = crearDocumentoPDF("Medicamentos recetados y entregados por paciente", "landscape");
    if (!doc || !validarTablaPDF(doc)) {
        return;
    }
    const medicamentos = datos.medicamentos || [];
    const nombre = datos.paciente?.nombre || document.getElementById("pacienteMedicamentos").options[document.getElementById("pacienteMedicamentos").selectedIndex]?.text || "Paciente";
    const periodo = obtenerPeriodo(fechaInicio, fechaFin);
    let posicionY = agregarInformacionPacientePDF(doc, nombre, periodo);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha de nacimiento: ${formatearFecha(datos.paciente?.fechaNacimiento)}`, 14, posicionY);
    doc.text(`Fecha de ingreso: ${formatearFecha(datos.paciente?.fechaIngreso)}`, 14, posicionY + 6);
    posicionY += 14;

    const filas = medicamentos.map(item => [
        formatearFecha(item.fechaReceta), item.medicamento || "-", item.dosis || "-", item.frecuencia || "-", item.cantidad ?? "-",
        item.fechaEntrega
            ? formatearFecha(item.fechaEntrega)
            : "Pendiente"]);
    if (!filas.length) {
        filas.push(["-", "No hay medicamentos registrados.", "-", "-", "-", "Pendiente"]);
    }

    doc.autoTable({
        startY: posicionY,
        head: [["Fecha", "Medicamento", "Dosis", "Frecuencia", "Cantidad", "Entrega"]],
        body: filas,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [55, 65, 81],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    const medicamentosDiferentes = datos.medicamentosDiferentes ??
        new Set(medicamentos.filter(item => item.medicamento).map(item => item.medicamento)).size;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total de medicamentos: ${datos.totalMedicamentos ?? medicamentos.length}`, 14, finalY);
    doc.text(`Medicamentos diferentes: ${medicamentosDiferentes}`, 14, finalY + 6);
    guardarPDF(doc, `Medicamentos_${limpiarNombreArchivo(nombre)}`);
}