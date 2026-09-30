const API = "http://localhost:5054/api";
let citas = [];
let citasPendientes = [];
let citasCompletadas = [];
let paginaPendientes = 1;
let paginaCompletadas = 1;
const registrosPorPagina = 10;

document.addEventListener("DOMContentLoaded", () => {
    cargarPerfilMedico();
    cargarCitas();
    configurarNotificaciones();
    const modal = document.getElementById("modalVisita");
    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === this) {
                cerrarVisita();
            }
        });
    }
});

function cargarPerfilMedico() {
}

function cargarCitas() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        console.error("No existe usuarioId.");
        return;
    }
    console.log("Cargando citas del especialista:", usuarioId);
    fetch(`${API}/Citas/especialista/${usuarioId}`)
        .then(response => {
            console.log("Respuesta Citas:", response.status);
            if (!response.ok) {
                throw new Error(`No se pudieron cargar las citas. Código HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Citas recibidas:", data);
            citas = Array.isArray(data) ? data : [];
            if (citas.length > 0 && citas[0].especialista) {
                const nombre = citas[0].especialista.nombreCompleto || "Médico especialista";
                const nombreSidebar = document.getElementById("nombreMedicoSidebar");
                const nombreTop = document.getElementById("nombreMedicoTop");
                if (nombreSidebar) {
                    nombreSidebar.textContent = nombre;
                }
                if (nombreTop) {
                    nombreTop.textContent = nombre;
                }
            }
            const especialidadSidebar = document.getElementById("especialidadMedicoSidebar");
            const especialidadTop = document.getElementById("especialidadMedicoTop");
            if (especialidadSidebar) {
                especialidadSidebar.textContent = "Especialista";
            }
            if (especialidadTop) {
                especialidadTop.textContent = "Especialista";
            }
            separarCitas();
            paginaPendientes = 1;
            paginaCompletadas = 1;
            mostrarCitasPendientes();
            mostrarCitasCompletadas();
            actualizarProximaAtencion();
            prepararNotificaciones();
        })
        .catch(error => {
            console.error("ERROR AL CARGAR CITAS:", error);
            const tablaPendientes = document.getElementById("tablaCitasPendientes");
            if (tablaPendientes) {
                tablaPendientes.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-table">
                            No se pudieron cargar las citas.
                        </td>
                    </tr>
                `;
            }
            const tablaCompletadas = document.getElementById("tablaCitasCompletadas");
            if (tablaCompletadas) {
                tablaCompletadas.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-table">
                            No se pudieron cargar las citas.
                        </td>
                    </tr>
                `;
            }
        });
}

function separarCitas() {
    citasPendientes = citas.filter(cita => {
        return cita.estado === "Programada";
    });
    citasCompletadas = citas.filter(cita => {
        return cita.estado === "Completada" || cita.estado === "Atendida" || cita.estado === "Finalizada";
    });
    const textoPendientes = document.getElementById("textoCantidadPendientes");
    if (textoPendientes) {
        textoPendientes.textContent = `${citasPendientes.length} ${citasPendientes.length === 1 ? "cita" : "citas"} pendientes`;
    }
    const badge = document.getElementById("badgeCitasPendientes");
    if (badge) {
        badge.textContent = citasPendientes.length;
    }
    const textoCompletadas = document.getElementById("textoCompletadas");
    if (textoCompletadas) {
        textoCompletadas.textContent = `${citasCompletadas.length} ${citasCompletadas.length === 1 ? "cita completada" : "citas completadas"}`;
    }
}

function mostrarCitasPendientes() {
    const tbody = document.getElementById("tablaCitasPendientes");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = "";
    const inicio = (paginaPendientes - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const citasPagina = citasPendientes.slice(inicio, fin);
    if (citasPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No hay citas pendientes.
                </td>
            </tr>
        `;
        actualizarPaginacion("paginacionPendientes", citasPendientes.length, paginaPendientes, cambiarPaginaPendientes);
        return;
    }
    citasPagina.forEach(cita => {
        const fecha = new Date(cita.fechaHora);
        const fechaTexto = fecha.toLocaleDateString("es-GT");
        const horaTexto = fecha.toLocaleTimeString("es-GT", {
            hour: "numeric",
            minute: "2-digit"
        });
        const nombrePaciente = cita.interno ? `${cita.interno.nombre} ${cita.interno.apellido}` : "Sin paciente";
        const motivo = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
        const enfermero = cita.solicitud?.enfermero?.nombreCompleto || "Sin asignar";
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${fechaTexto}</td>
            <td>${horaTexto}</td>
            <td><strong>${nombrePaciente}</strong></td>
            <td>${motivo}</td>
            <td>${enfermero}</td>
            <td><span class="status-badge pending">${cita.estado}</span></td>
            <td>
                <a href="atenderPaciente.html?id=${cita.id}" class="btn-attend">
                    <i class="ph ph-stethoscope"></i>
                    Atender
                </a>
            </td>
        `;
        tbody.appendChild(fila);
    });
    actualizarPaginacion("paginacionPendientes", citasPendientes.length, paginaPendientes, cambiarPaginaPendientes);
}

function mostrarCitasCompletadas() {
    const tbody = document.getElementById("tablaCitasCompletadas");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = "";
    const inicio = (paginaCompletadas - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const citasPagina = citasCompletadas.slice(inicio, fin);
    if (citasPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No hay citas atendidas.
                </td>
            </tr>
        `;
        actualizarPaginacion("paginacionCompletadas", citasCompletadas.length, paginaCompletadas, cambiarPaginaCompletadas);
        return;
    }
    citasPagina.forEach(cita => {
        const fecha = new Date(cita.fechaHora);
        const fechaTexto = fecha.toLocaleDateString("es-GT");
        const horaTexto = fecha.toLocaleTimeString("es-GT", {
            hour: "numeric",
            minute: "2-digit"
        });
        const nombrePaciente = cita.interno ? `${cita.interno.nombre} ${cita.interno.apellido}` : "Sin paciente";
        const motivo = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${fechaTexto}</td>
            <td>${horaTexto}</td>
            <td><strong>${nombrePaciente}</strong></td>
            <td>${motivo}</td>
            <td><span class="status-badge completed">${cita.estado}</span></td>
            <td>
                <button type="button" class="btn-view" onclick="abrirVisita(${cita.id})">
                    <i class="ph ph-eye"></i>
                    Ver visita
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    actualizarPaginacion("paginacionCompletadas", citasCompletadas.length, paginaCompletadas, cambiarPaginaCompletadas);
}

function actualizarPaginacion(idContenedor, totalRegistros, paginaActual, funcionCambio) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (totalRegistros === 0) {
        return;
    }
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    const informacion = document.createElement("span");
    informacion.className = "pagination-info";
    informacion.textContent = `Mostrando ${inicio} - ${fin} de ${totalRegistros} citas`;
    const controles = document.createElement("div");
    controles.className = "pagination-controls";
    const botonAnterior = document.createElement("button");
    botonAnterior.type = "button";
    botonAnterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    botonAnterior.disabled = paginaActual === 1;
    botonAnterior.onclick = () => {
        funcionCambio(paginaActual - 1);
    };
    controles.appendChild(botonAnterior);
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = pagina;
        if (pagina === paginaActual) {
            boton.classList.add("active");
        }
        boton.onclick = () => {
            funcionCambio(pagina);
        };
        controles.appendChild(boton);
    }
    const botonSiguiente = document.createElement("button");
    botonSiguiente.type = "button";
    botonSiguiente.innerHTML = `<i class="ph ph-caret-right"></i>`;
    botonSiguiente.disabled = paginaActual === totalPaginas;
    botonSiguiente.onclick = () => {
        funcionCambio(paginaActual + 1);
    };
    controles.appendChild(botonSiguiente);
    contenedor.appendChild(informacion);
    contenedor.appendChild(controles);
}

function cambiarPaginaPendientes(pagina) {
    paginaPendientes = pagina;
    mostrarCitasPendientes();
}

function cambiarPaginaCompletadas(pagina) {
    paginaCompletadas = pagina;
    mostrarCitasCompletadas();
}

function actualizarProximaAtencion() {
    const contenedor = document.getElementById("proximaAtencion");
    if (!contenedor) {
        return;
    }
    const ahora = new Date();
    const citasHoy = citasPendientes.filter(cita => {
        const fecha = new Date(cita.fechaHora);
        const fechaCita = fecha.toISOString().split("T")[0];
        const hoy = ahora.toISOString().split("T")[0];
        return fechaCita === hoy;
    }).sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    if (citasHoy.length === 0) {
        contenedor.style.display = "none";
        return;
    }
    const cita = citasHoy[0];
    const fecha = new Date(cita.fechaHora);
    const paciente = cita.interno ? `${cita.interno.nombre} ${cita.interno.apellido}` : "Sin paciente";
    document.getElementById("proximaPaciente").textContent = paciente;
    document.getElementById("proximaHora").textContent = fecha.toLocaleTimeString("es-GT", {
        hour: "numeric",
        minute: "2-digit"
    });
    document.getElementById("proximaFecha").textContent = fecha.toLocaleDateString("es-GT", {
        day: "numeric",
        month: "long"
    });
    document.getElementById("proximaMotivo").textContent = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
    const boton = document.getElementById("btnProximaAtencion");
    if (boton) {
        boton.href = `atenderPaciente.html?id=${cita.id}`;
    }
    contenedor.style.display = "flex";
}

function mostrarPanelNotificaciones() {
    const panel = document.getElementById("panelNotificaciones");
    if (!panel) {
        return;
    }
    if (panel.style.display === "block") {
        panel.style.display = "none";
        return;
    }
    panel.style.display = "block";
}

function renderizarNotificaciones(nuevas) {
    const lista = document.getElementById("listaNotificaciones");
    const contador = document.getElementById("contadorNotificaciones");
    if (!lista) {
        return;
    }
    if (contador) {
        contador.textContent = `${nuevas.length} ${nuevas.length === 1 ? "nueva" : "nuevas"}`;
    }
    const punto = document.getElementById("notificationDot");
    if (punto) {
        punto.style.display = nuevas.length > 0 ? "block" : "none";
    }
    if (nuevas.length === 0) {
        lista.innerHTML = `
            <div class="notificacion-vacia">
                <i class="ph ph-check-circle"></i>
                <p>No tienes notificaciones nuevas.</p>
            </div>
        `;
        return;
    }
    lista.innerHTML = "";
    nuevas.forEach(function (cita) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "notificacion-item";
        const paciente = cita.interno ? `${cita.interno.nombre} ${cita.interno.apellido}` : "Interno";
        const motivo = cita.motivo || cita.solicitud?.motivo || "-";
        item.innerHTML = `
            <div class="notificacion-icon">
                <i class="ph ph-calendar-check"></i>
            </div>
            <div class="notificacion-text">
                <strong>Nueva cita programada</strong>
                <span>${paciente}</span>
                <small>${motivo} · ${formatearFechaHora(cita.fechaHora)}</small>
            </div>
        `;
        item.addEventListener("click", function () {
            marcarUnaNotificacionVista(cita.id);
            window.location.href = `atenderPaciente.html?id=${cita.id}`;
        });
        lista.appendChild(item);
    });
}

function marcarUnaNotificacionVista(citaId) {
    const usuarioId = localStorage.getItem("usuarioId");
    const clave = `notificacionesEspecialista_${usuarioId}`;
    let vistas = [];
    try {
        vistas = JSON.parse(localStorage.getItem(clave)) || [];
    } catch {
        vistas = [];
    }
    if (!vistas.includes(citaId)) {
        vistas.push(citaId);
    }
    localStorage.setItem(clave, JSON.stringify(vistas));
    prepararNotificaciones();
}

function marcarNotificacionesVistas() {
    const usuarioId = localStorage.getItem("usuarioId");
    const clave = `notificacionesEspecialista_${usuarioId}`;
    const ids = citasPendientes
        .filter(cita => cita.id && cita.estado && (cita.estado.toLowerCase() === "programada" || cita.estado.toLowerCase() === "pendiente"))
        .map(cita => cita.id);
    localStorage.setItem(clave, JSON.stringify(ids));
    prepararNotificaciones();
}

function prepararNotificaciones() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        return;
    }
    const clave = `notificacionesEspecialista_${usuarioId}`;
    let vistas = [];
    try {
        vistas = JSON.parse(localStorage.getItem(clave)) || [];
    } catch {
        vistas = [];
    }
    const nuevas = citasPendientes.filter(cita => cita.id && !vistas.includes(cita.id));
    renderizarNotificaciones(nuevas);
}

function formatearFechaHora(fechaHora) {
    if (!fechaHora) {
        return "-";
    }
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function configurarNotificaciones() {
    const boton = document.getElementById("btnNotificaciones");
    const panel = document.getElementById("panelNotificaciones");
    if (!boton || !panel) {
        return;
    }
    boton.addEventListener("click", (event) => {
        event.stopPropagation();
        mostrarPanelNotificaciones();
    });
    panel.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    document.addEventListener("click", () => {
        panel.style.display = "none";
    });
    const botonMarcar = document.getElementById("btnMarcarNotificaciones");
    if (botonMarcar) {
        botonMarcar.addEventListener("click", () => {
            marcarNotificacionesVistas();
        });
    }
}

function marcarNotificacionVista(citaId) {
    let notificacionesVistas = [];
    try {
        notificacionesVistas = JSON.parse(localStorage.getItem("notificacionesEspecialista")) || [];
    } catch (error) {
        notificacionesVistas = [];
    }
    if (!notificacionesVistas.includes(citaId)) {
        notificacionesVistas.push(citaId);
    }
    localStorage.setItem("notificacionesEspecialista", JSON.stringify(notificacionesVistas));
}

function abrirVisita(citaId) {
    console.log("Consultando atención de cita:", citaId);
    fetch(`${API}/Atenciones/cita/${citaId}`)
        .then(async response => {
            const texto = await response.text();
            console.log("Respuesta Atenciones:", response.status);

            if (!response.ok) {
                let mensaje = `Error HTTP ${response.status}`;
                try {
                    const errorData = JSON.parse(texto);
                    if (errorData.mensaje) {
                        mensaje = errorData.mensaje;
                    }
                } catch {
                    if (texto) {
                        console.error("Respuesta del servidor:", texto);
                    }
                }
                throw new Error(mensaje);
            }

            try {
                return JSON.parse(texto);
            } catch {
                throw new Error(
                    "La respuesta de la API no tiene un formato válido."
                );
            }
        })
        .then(data => {
            console.log("Datos de atención:", data);
            if (!data.existe || !data.atencion) {
                throw new Error(
                    "La cita todavía no tiene una atención médica registrada."
                );
            }
            llenarModalVisita(data);
            document
                .getElementById("modalVisita")
                .classList.add("active");
        })
        .catch(error => {
            console.error("Error al abrir visita:", error);
            alert(error.message);
        });
}

function cerrarVisita() {
    const modal = document.getElementById("modalVisita");
    if (modal) {
        modal.classList.remove("active");
    }
}

function llenarModalVisita(data) {
    const cita = data.cita;
    const atencion = data.atencion;
    const paciente = cita?.interno;

    document.getElementById("modalNombrePaciente").textContent = paciente
            ? `${paciente.nombre} ${paciente.apellido}`
            : "Paciente";
    document.getElementById("modalIdentificacionAtencion").textContent = paciente?.dpi
            ? `DPI: ${paciente.dpi}`
            : "Sin identificación";
    document.getElementById("modalFecha").textContent = atencion?.fechaAtencion
            ? new Date(atencion.fechaAtencion)
                .toLocaleDateString("es-GT")
            : "—";
    document.getElementById("modalMedico").textContent = cita?.especialista?.nombreCompleto || cita?.especialista?.nombreUsuario || "—";
    document.getElementById("modalEspecialidad").textContent = "Especialista";
    document.getElementById("modalEnfermero").textContent = cita?.solicitud?.enfermero?.nombreCompleto || "Sin asignar";
    document.getElementById("modalMotivo").textContent = cita?.motivo || cita?.solicitud?.motivo || "—";
    document.getElementById("modalDiagnostico").textContent = atencion?.diagnosticoFinal || atencion?.diagnostico || "—";
    document.getElementById("modalObservaciones").textContent = atencion?.observaciones || "Sin observaciones";
    mostrarExamenesModal(atencion?.examenesLaboratorio || []);
    mostrarMedicamentosModal(atencion?.recetas || []);
}

function mostrarExamenesModal(examenes) {
    const contenedor = document.getElementById("modalExamenes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (!examenes || examenes.length === 0) {
        contenedor.innerHTML = `
            <span class="empty-list">
                No se solicitaron exámenes.
            </span>
        `;
        return;
    }
    examenes.forEach(examen => {
        const elemento = document.createElement("div");
        elemento.className = "visit-list-item";
        elemento.innerHTML = `
            <strong>${examen.tipoExamen || "Examen"}</strong>
            <span>${examen.estado || ""}</span>
        `;
        contenedor.appendChild(elemento);
    });
}

function mostrarMedicamentosModal(recetas) {
    const contenedor = document.getElementById("modalMedicamentos");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (!recetas || recetas.length === 0) {
        contenedor.innerHTML = `
            <span class="empty-list">
                No se registraron medicamentos.
            </span>
        `;
        return;
    }
    let hayMedicamentos = false;
    recetas.forEach(receta => {
        if (!receta.detalleReceta) {
            return;
        }
        receta.detalleReceta.forEach(medicamento => {
            hayMedicamentos = true;
            const elemento = document.createElement("div");
            elemento.className = "visit-list-item";
            elemento.innerHTML = `
                <strong>
                    ${medicamento.medicamento || "Medicamento"}
                </strong>

                <span>
                    ${medicamento.dosis || ""}
                    ${medicamento.frecuencia || ""}
                </span>
            `;
            contenedor.appendChild(elemento);
        });
    });
    if (!hayMedicamentos) {
        contenedor.innerHTML = `
            <span class="empty-list">
                No se registraron medicamentos.
            </span>
        `;
    }
}