const API = "http://localhost:5054/api";
let solicitudes = [];
let solicitudesProcesadas = [];
let citasPorSolicitud = new Map();
let paginaActual = 1;
const solicitudesPorPagina = 10;
let solicitudesFiltradas = [];

document.addEventListener("DOMContentLoaded", async () => {
    cargarUsuario();
    configurarEventos();
    await cargarSolicitudes();
});

/* USUARIO LOGUEADO */
function cargarUsuario() {
    const nombreCompleto = localStorage.getItem("nombreCompleto");
    const elemento = document.getElementById("nombreUsuario");
    if (!elemento) {
        return;
    }
    elemento.textContent = nombreCompleto || "Médico General";
}


function configurarEventos() {
    const buscar = document.getElementById("buscar");
    const estado = document.getElementById("estado");
    if (buscar) {
        buscar.addEventListener("input", aplicarFiltros);
    }
    if (estado) {
        estado.addEventListener("change", aplicarFiltros);
    }

    const cerrarModalBoton = document.getElementById("cerrarModal");
    if (cerrarModalBoton) {
        cerrarModalBoton.addEventListener("click", cerrarModal);
    }

    const cerrarModalFooter = document.getElementById("cerrarModalFooter");
    if (cerrarModalFooter) {
        cerrarModalFooter.addEventListener("click", cerrarModal);
    }

    const modal = document.getElementById("modalResultado");
    if (modal) {
        modal.addEventListener(
            "click",
            function (event) {
                if (event.target === this) {
                    cerrarModal();
                }
            }
        );
    }
}

async function cargarSolicitudes() {
    const medicoGeneralId = localStorage.getItem("usuarioId");
    if (!medicoGeneralId) {
        mostrarMensaje("No se encontró el usuario médico general.", true);
        return;
    }
    try {
        const response = await fetch(`${API}/Fundacion/solicitudes/medico/${medicoGeneralId}`);
        if (!response.ok) {
            throw new Error("No se pudieron obtener las solicitudes.");
        }
        solicitudes = await response.json();
        solicitudesProcesadas = [];
        citasPorSolicitud.clear();
        await procesarSolicitudes();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        mostrarMensaje("No se pudieron cargar las solicitudes.", true);
    }
}

async function procesarSolicitudes() {
    for (const solicitud of solicitudes) {
        const solicitudProcesada = {
            ...solicitud,
            estadoMostrar: solicitud.estado || "Pendiente",
            cita: null,
            atencion: null
        };
        if (
            solicitud.estado === "Programada" || solicitud.estado === "Completada"
        ) {
            if (solicitud.especialista?.id) {
                
                const cita = await buscarCitaSolicitud(solicitud.id, solicitud.especialista.id);
                solicitudProcesada.cita = cita;
                if (cita) {
                    const atencion = await obtenerAtencion(cita.id);
                    solicitudProcesada.atencion = atencion;
                    if (
                        atencion && atencion.estado && atencion.estado.toLowerCase() === "completada"
                    ) {
                        solicitudProcesada.estadoMostrar = "Completada";
                    }
                }
            }
        }
        solicitudesProcesadas.push(solicitudProcesada);
    }
}

async function buscarCitaSolicitud(
    solicitudId,
    especialistaId
) {
    const clave = `${especialistaId}`;
    if (!citasPorSolicitud.has(clave)) {
        try {
            const response = await fetch(`${API}/Citas/especialista/${especialistaId}`);
            if (!response.ok) {
                console.error("No se pudieron obtener las citas del especialista.");
                return null;
            }

            const citas = await response.json();
            citasPorSolicitud.set(clave, citas);
        } catch (error) {
            console.error("Error al consultar citas:", error);
            return null;
        }
    }

    const citas = citasPorSolicitud.get(clave) || [];
    return citas.find(cita => Number(cita.solicitudID) === Number(solicitudId)) || null;
}

async function obtenerAtencion(citaId) {
    if (!citaId) {
        return null;
    }
    try {
        const response = await fetch(`${API}/Atenciones/cita/${citaId}`);
        if (!response.ok) {
            return null;
        }

        const datos = await response.json();
        if (
            !datos || !datos.existe || !datos.atencion
        ) {
            return null;
        }
        return datos.atencion;
    } catch (error) {
        console.error("Error al obtener atención:", error);
        return null;
    }
}

function aplicarFiltros() {
    const buscar = document.getElementById("buscar");
    const estadoSelect = document.getElementById("estado");
    const texto = buscar
            ? buscar.value.trim().toLowerCase()
            : "";
    const estado = estadoSelect
            ? estadoSelect.value
            : "";

    const filtradas =
        solicitudesProcesadas.filter(
            solicitud => {
                const nombre = solicitud.interno?.nombreCompleto || `${solicitud.interno?.nombre || ""} ${solicitud.interno?.apellido || ""}`.trim();
                const numero =solicitud.internoID?.toString() || "";
                const coincideBusqueda = !texto || nombre.toLowerCase().includes(texto) || numero.includes(texto);
                const coincideEstado = !estado || solicitud.estadoMostrar === estado;
                return (coincideBusqueda && coincideEstado);
            }
        );
    solicitudesFiltradas = filtradas;
    paginaActual = 1;
    renderizarSolicitudes(filtradas);
}

function renderizarSolicitudes(lista) {
    const contenedor = document.getElementById("listaSolicitudes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (!lista.length) {
        mostrarMensaje("No hay solicitudes que coincidan con los filtros.");
        renderizarPaginacion(0);
        return;
    }

    const totalSolicitudes = lista.length;
    const totalPaginas = Math.ceil(totalSolicitudes / solicitudesPorPagina);
    if (
        paginaActual > totalPaginas
    ) {
        paginaActual = totalPaginas;
    }

    const inicio = (paginaActual - 1) * solicitudesPorPagina;
    const fin = inicio + solicitudesPorPagina;
    
    const solicitudesPagina = lista.slice(inicio, fin);
    solicitudesPagina.forEach(
        solicitud => {
            contenedor.innerHTML += crearFilaSolicitud(solicitud);
        }
    );
    renderizarPaginacion(totalSolicitudes);
}

function crearFilaSolicitud(
    solicitud
) {
    const interno = solicitud.interno;
    const idInterno =
        interno?.id ??
        solicitud.internoID ??
        "—";
    const nombreInterno = interno?.nombreCompleto || `${interno?.nombre || ""} ${interno?.apellido || ""}`.trim() || "Sin información";
    const especialidad = solicitud.especialidad?.nombre || "Sin especialidad";
    const enfermero = solicitud.enfermero?.nombreCompleto || "Por asignar";
    const especialista = solicitud.especialista?.nombreCompleto || "Por asignar";
    const fechaSolicitud = solicitud.fechaSolicitud
            ? formatearFecha(solicitud.fechaSolicitud): "—";
    const estado = solicitud.estadoMostrar || "Pendiente";
    const puedeVerResultado = estado === "Completada" && solicitud.atencion != null;
    return `
        <tr>
            <td>
                <div class="table-person">
                    <span>
                        ${escapeHtml(nombreInterno)}
                    </span>
                </div>
            </td>

            <td>
                <span class="table-text">
                    ${escapeHtml(especialidad)}
                </span>
            </td>

            <td>
                <span class="table-text">
                    ${escapeHtml(enfermero)}
                </span>
            </td>

            <td>
                <span class="table-text">
                    ${escapeHtml(especialista)}
                </span>
            </td>

            <td>
                <span class="table-date">
                    ${escapeHtml(fechaSolicitud)}
                </span>
            </td>

            <td>
                <span class="status ${obtenerClaseEstado(estado)}">
                    ${escapeHtml(estado)}
                </span>
            </td>

            <td>
                <div class="table-actions">
                    ${
                        puedeVerResultado
                            ? `
                                <button
                                    type="button"
                                    class="view-button"
                                    title="Ver resultado"
                                    onclick="verResultado(${solicitud.id})"
                                >
                                    <i class="ph ph-eye"></i>
                                </button>
                            `

                            : `
                                <button
                                    type="button"
                                    class="view-button disabled"
                                    disabled
                                    title="Resultado no disponible"
                                >
                                    <i class="ph ph-eye"></i>
                                </button>
                            `
                    }
                </div>
            </td>
        </tr>
    `;
}

async function verResultado(
    solicitudId
) {
    const solicitud = solicitudesProcesadas.find(item => Number(item.id) === Number(solicitudId));
    if (!solicitud) {
        alert("No se encontró la solicitud.");
        return;
    }
    if (!solicitud.cita) {
        alert("La cita de esta solicitud no fue encontrada.");
        return;
    }
    
    try {
        let atencion = solicitud.atencion;
        if (!atencion) {
            atencion = await obtenerAtencion(solicitud.cita.id);
        }
        if (!atencion) {
            alert("No se encontró la atención médica.");
            return;
        }
        if (
            !atencion.estado || atencion.estado.toLowerCase() !== "completada"
        ) {
            alert("La atención médica todavía no ha sido completada.");
            return;
        }
        llenarInformacionModal(solicitud, atencion);
        abrirModal();
        cargarMedicamentos(atencion.recetas);
        cargarLaboratorio(atencion.examenesLaboratorio, atencion.id);
    } catch (error) {
        console.error("Error al mostrar resultado:", error);
        alert("No se pudo cargar el resultado de la atención.");
    }
}

function renderizarPaginacion(
    totalSolicitudes
) {
    const contenedor = document.getElementById("paginacionSolicitudes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (
        totalSolicitudes <= solicitudesPorPagina
    ) {
        return;
    }

    const totalPaginas = Math.ceil(totalSolicitudes / solicitudesPorPagina);
    const inicio = (paginaActual - 1) * solicitudesPorPagina + 1;
    const fin = Math.min(paginaActual * solicitudesPorPagina, totalSolicitudes);

    contenedor.innerHTML = `
        <div class="pagination-info">
            ${inicio} - ${fin}
            solicitudes
        </div>

        <div class="pagination-controls">
            <button
                type="button"
                ${paginaActual === 1 ? "disabled" : ""}
                onclick="cambiarPagina(${paginaActual - 1})"
                aria-label="Página anterior"
            >
                <i class="ph ph-caret-left"></i>
            </button>

            ${crearBotonesPaginas(totalPaginas)}
            <button
                type="button"
                ${
                    paginaActual === totalPaginas
                        ? "disabled"
                        : ""
                }
                onclick="cambiarPagina(${paginaActual + 1})"
                aria-label="Página siguiente"
            >
                <i class="ph ph-caret-right"></i>
            </button>
        </div>
    `;
}

function crearBotonesPaginas(
    totalPaginas
) {
    let botones = "";
    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        botones += `
            <button
                type="button"
                class="${
                    pagina === paginaActual
                        ? "active"
                        : ""
                }"
                onclick="cambiarPagina(${pagina})"
            >
                ${pagina}
            </button>
        `;
    }
    return botones;
}

function cambiarPagina(
    pagina
) {
    const totalPaginas = Math.ceil(solicitudesFiltradas.length / solicitudesPorPagina);
    if (
        pagina < 1 || pagina > totalPaginas
    ) {
        return;
    }
    paginaActual = pagina;
    renderizarSolicitudes(solicitudesFiltradas);
}

function llenarInformacionModal(
    solicitud,
    atencion
) {
    const interno = solicitud.interno;
    
    const elementoInterno = document.getElementById("resultadoInterno");
    if (elementoInterno) {
        elementoInterno.textContent = interno?.nombreCompleto || `${interno?.nombre || ""} ${interno?.apellido || ""}`.trim() || "Sin información";
    }

    const elementoEspecialidad = document.getElementById("resultadoEspecialidad");
    if (elementoEspecialidad) {
        elementoEspecialidad.textContent = solicitud.especialidad?.nombre || "Sin información";
    }

    const elementoEspecialista = document.getElementById("resultadoEspecialista");
    if (elementoEspecialista) {
        elementoEspecialista.textContent = solicitud.especialista?.nombreCompleto || "Sin información";
    }

    const elementoFecha = document.getElementById("resultadoFechaAtencion");
    if (elementoFecha) {
        elementoFecha.textContent = solicitud.cita?.fechaHora
                ? formatearFechaHora(solicitud.cita.fechaHora): formatearFecha(atencion.fechaAtencion);
    }

    const elementoDiagnostico = document.getElementById("resultadoDiagnostico");
    if (elementoDiagnostico) {
        elementoDiagnostico.textContent = atencion.diagnosticoFinal || "No se registró diagnóstico final.";
    }

    const elementoObservaciones = document.getElementById("resultadoObservaciones");
    if (elementoObservaciones) {
        elementoObservaciones.textContent = atencion.observaciones || "No se registraron observaciones.";
    }

    const laboratorio = document.getElementById("resultadoLaboratorio");
    if (laboratorio) {
        laboratorio.innerHTML = `
            <div class="empty-result">
                <i class="ph ph-spinner"></i>
                <span>
                    Cargando resultados de laboratorio...
                </span>
            </div>
        `;
    }
}

function cargarMedicamentos(
    recetas
) {
    const contenedor = document.getElementById("resultadoMedicamentos");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (
        !recetas || !recetas.length
    ) {
        contenedor.innerHTML = `
            <div class="empty-result">
                <i class="ph ph-pill"></i>
                <span>
                    No se registraron medicamentos.
                </span>
            </div>
        `;
        return;
    }
    let hayMedicamentos = false;

    recetas.forEach(
        receta => {
            const detalles = receta.detalleReceta || [];
            if (!detalles.length) {
                return;
            }

            detalles.forEach(
                detalle => {
                    hayMedicamentos = true;
                    contenedor.innerHTML += `
                        <div class="result-item">
                            <div>
                                <strong>
                                    ${escapeHtml(
                                        detalle.medicamento || "Medicamento"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        detalle.indicaciones || "Sin indicaciones"
                                    )}
                                </span>
                            </div>

                            <div>
                                <small>
                                    Dosis
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        detalle.dosis || "—"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>
                                    Frecuencia
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        detalle.frecuencia || "—"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <small>
                                    Duración
                                </small>

                                <strong>
                                    ${escapeHtml(
                                        detalle.duracion || "—"
                                    )}
                                </strong>
                            </div>
                        </div>
                    `;
                }
            );
        }
    );

    if (!hayMedicamentos) {
        contenedor.innerHTML = `
            <div class="empty-result">
                <i class="ph ph-pill"></i>
                <span>
                    No se registraron medicamentos.
                </span>
            </div>
        `;
    }
}

async function cargarLaboratorio(
    examenes,
    atencionId
) {
    const contenedor = document.getElementById("resultadoLaboratorio");
    if (!contenedor) {
        return;
    }

    try {
        const response = await fetch(`${API}/ResultadosLaboratorio/atencion/${atencionId}`);
        if (!response.ok) {
            throw new Error("No se pudieron obtener los resultados.");
        }

        const resultados = await response.json();
        contenedor.innerHTML = "";
        if (
            !resultados || !resultados.length
        ) {
            if (
                examenes && examenes.length
            ) {
                examenes.forEach(
                    examen => {
                        contenedor.innerHTML += `
                            <div class="result-item">
                                <div>
                                    <strong>
                                        ${escapeHtml(
                                            examen.tipoExamen || "Examen"
                                        )}
                                    </strong>

                                    <span>
                                        Resultado pendiente
                                    </span>
                                </div>

                                <div>
                                    <small>
                                        Estado
                                    </small>

                                    <strong>
                                        ${escapeHtml(
                                            examen.estado || "Pendiente"
                                        )}
                                    </strong>
                                </div>
                            </div>
                        `;
                    }
                );
            } else {
                mostrarSinLaboratorio(contenedor);
            }
            return;
        }
        resultados.forEach(
            item => {
                const examen = item.examenLaboratorio;
                contenedor.innerHTML += `
                    <div class="result-item laboratory-item">
                        <div>
                            <strong>
                                ${escapeHtml(
                                    examen?.tipoExamen || "Examen"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    item.resultado || "Sin resultado"
                                )}
                            </span>
                        </div>

                        <div>
                            <small>
                                Fecha
                            </small>

                            <strong>
                                ${formatearFecha(
                                    item.fechaResultado
                                )}
                            </strong>
                        </div>

                        <div>
                            <small>
                                Observaciones
                            </small>

                            <strong>
                                ${escapeHtml(
                                    item.observaciones || "Sin observaciones"
                                )}
                            </strong>
                        </div>
                    </div>
                `;
            }
        );
    } catch (error) {
        console.error("Error al cargar laboratorio:", error);
        mostrarSinLaboratorio(contenedor);
    }
}

function mostrarSinLaboratorio(
    contenedor
) {
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = `
        <div class="empty-result">
            <i class="ph ph-test-tube"></i>
            <span>
                No se registraron resultados de laboratorio.
            </span>
        </div>
    `;
}

function abrirModal() {
    const modal = document.getElementById("modalResultado");
    if (!modal) {
        return;
    }
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function cerrarModal() {
    const modal = document.getElementById("modalResultado");
    if (!modal) {
        return;
    }
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

function obtenerClaseEstado(
    estado
) {
    switch (estado) {
        case "Programada":
            return "scheduled";
        case "Completada":
            return "completed";
        case "Pendiente":
        default:
            return "pending";
    }
}

function obtenerTextoSecundario(
    solicitud
) {
    if (
        solicitud.estadoMostrar === "Pendiente"
    ) {
        return `Enviada ${formatearFecha(solicitud.fechaSolicitud)}`;
    }
    if (
        solicitud.estadoMostrar === "Programada"
    ) {
        return solicitud.especialista?.nombreCompleto || "Especialista asignado";
    }
    if (
        solicitud.estadoMostrar === "Completada"
    ) {
        return "Atención completada";
    }
    return "";
}

function mostrarMensaje(
    mensaje, error = false
) {
    const contenedor = document.getElementById("listaSolicitudes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="empty-list ${error ? "error" : ""}"
            >
                <i class="ph ${
                    error
                        ? "ph-warning-circle"
                        : "ph-clipboard"
                }"></i>
                <p>
                    ${escapeHtml(mensaje)}
                </p>
            </td>
        </tr>
    `;
}

function formatearFecha(
    fecha
) {
    if (!fecha) {
        return "—";
    }

    const date = new Date(fecha);
    if (
        Number.isNaN(date.getTime())
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatearFechaHora(
    fecha
) {
    if (!fecha) {
        return "Por asignar";
    }

    const date = new Date(fecha);
    if (
        Number.isNaN(date.getTime())
    ) {
        return "Por asignar";
    }
    return date.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ) +
        " · " +
        date.toLocaleTimeString(
            "es-GT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}

function escapeHtml(
    valor
) {
    if (
        valor === null || valor === undefined
    ) {
        return "";
    }
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}