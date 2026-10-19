const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Fundacion";
let solicitudes = [];
let solicitudesFiltradas = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let solicitudSeleccionada = null;
const NOTIFICACIONES_FUNDACION = "notificacionesFundacionSolicitudesVistas";
let solicitudesNotificacion = [];

document.addEventListener("DOMContentLoaded", function () {
    actualizarSaludo();
    cargarSolicitudes();
    cargarNotificacionesFundacion();

    document.getElementById("buscarSolicitud").addEventListener("input", filtrarSolicitudes);
    document.getElementById("btnAnterior").addEventListener("click", paginaAnterior);
    document.getElementById("btnSiguiente").addEventListener("click", paginaSiguiente);
    document.getElementById("btnConfirmar").addEventListener("click", confirmarProgramacion);
    document.getElementById("btnNotificaciones").addEventListener("click", toggleNotificaciones);
});

function actualizarSaludo() {
    const greeting = document.getElementById("greeting");
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 12) {
        greeting.textContent = "¡Buenos días!";
    } else if (hora >= 12 && hora < 18) {
        greeting.textContent = "¡Buenas tardes!";
    } else {
        greeting.textContent = "¡Buenas noches!";
    }
}

async function cargarSolicitudes() {
    const tabla = document.getElementById("tablaSolicitudes");
    tabla.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Cargando solicitudes...
            </td>
        </tr>
    `;
    try {
        const respuesta = await fetch(`${API}/solicitudes`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las solicitudes.");
        }
        solicitudes = await respuesta.json();
        solicitudesFiltradas = [...solicitudes];
        paginaActual = 1;
        actualizarTabla();
    } catch (error) {
        console.error(error);
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No se pudieron cargar las solicitudes.
                </td>
            </tr>
        `;
    }
}

function actualizarTabla() {
    const tabla = document.getElementById("tablaSolicitudes");
    tabla.innerHTML = "";
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registros = solicitudesFiltradas.slice(inicio,fin);
    if (registros.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No hay solicitudes pendientes.
                </td>
            </tr>
        `;
    } else {
        registros.forEach(function (solicitud) {
            const fila = document.createElement("tr");
            const nombreInterno = solicitud.interno
                    ? solicitud.interno.nombreCompleto
                    : "Sin información";
            const nombreEspecialidad =solicitud.especialidad
                    ? solicitud.especialidad.nombre
                    : "Sin especialidad";
            const nombreEnfermero =solicitud.enfermero
                    ? solicitud.enfermero.nombreCompleto
                    : "Sin asignar";
            fila.innerHTML = `
                <td>
                    <div class="patient-info">
                        <div class="patient-avatar">
                            <i class="ph ph-person"></i>
                        </div>

                        <div>
                            <strong>
                                ${escapeHtml(
                                    nombreInterno
                                )}
                            </strong>

                            <span>
                                Interno #${String(
                                    solicitud.internoID
                                ).padStart(4, "0")}
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        nombreEspecialidad
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        nombreEnfermero
                    )}
                </td>

                <td>
                    ${formatearFecha(
                        solicitud.fechaSolicitud
                    )}
                </td>

                <td>
                    <span class="status pending">
                        ${escapeHtml(
                            solicitud.estado
                        )}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="btn-view"
                        onclick="abrirSolicitud(${solicitud.id})">
                        <i class="ph ph-eye"></i>
                        Revisar
                    </button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    }
    actualizarFooter();
}

// FOOTER / PAGINACIÓN
function actualizarFooter() {
    const total = solicitudesFiltradas.length;
    const totalPaginas = Math.ceil(total / registrosPorPagina);
    const inicio =
        total === 0
            ? 0
            : ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina,total);
    
    document.getElementById("infoPaginacion").textContent = `Mostrando ${inicio}-${fin} de ${total} solicitudes`;
    document.getElementById("btnAnterior").disabled = paginaActual <= 1;
    document.getElementById("btnSiguiente").disabled =paginaActual >= totalPaginas;
    generarNumerosPagina(totalPaginas);
}

function generarNumerosPagina(totalPaginas) {
    const contenedor = document.getElementById("numerosPagina" );
    contenedor.innerHTML = "";

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "page-number";
        if (pagina === paginaActual) {
            boton.classList.add("active");
        }
        boton.textContent = pagina;
        boton.addEventListener(
            "click",
            function () {
                paginaActual = pagina;
                actualizarTabla();
            }
        );
        contenedor.appendChild(boton);
    }
}

function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        actualizarTabla();
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(solicitudesFiltradas.length / registrosPorPagina);
    if (
        paginaActual < totalPaginas
    ) {
        paginaActual++;
        actualizarTabla();
    }
}

function filtrarSolicitudes() {
    const texto = document.getElementById("buscarSolicitud").value.toLowerCase().trim();
    solicitudesFiltradas =
        solicitudes.filter(function (solicitud) {
            const interno = solicitud.interno
                    ? solicitud.interno.nombreCompleto
                    : "";
            const especialidad = solicitud.especialidad
                    ? solicitud.especialidad.nombre
                    : "";
            const enfermero = solicitud.enfermero
                    ? solicitud.enfermero.nombreCompleto
                    : "";
            return (
                interno.toLowerCase().includes(texto) ||
                especialidad.toLowerCase().includes(texto)||
                enfermero.toLowerCase().includes(texto)
            );
        });
    paginaActual = 1;
    actualizarTabla();
}

// ABRIR SOLICITUD
async function abrirSolicitud(id) {
    try {
        const respuesta = await fetch(`${API}/solicitudes/${id}`);
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la solicitud.");
        }
        solicitudSeleccionada = await respuesta.json();
        mostrarDatosSolicitud();
        await cargarEspecialistas(solicitudSeleccionada.especialidadID);
        document.getElementById("modalSolicitud").classList.add("show");
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar la información de la solicitud.");
    }
}

// MOSTRAR DATOS DEL MODAL
function mostrarDatosSolicitud() {
    const solicitud = solicitudSeleccionada;
    const nombreInterno = solicitud.interno
            ? solicitud.interno.nombreCompleto
            : "-";
    const fechaNacimiento = solicitud.interno
            ? solicitud.interno.fechaNacimiento
            : null;
    const nombreEspecialidad = solicitud.especialidad
            ? solicitud.especialidad.nombre
            : "-";
    const nombreEnfermero = solicitud.enfermero
            ? solicitud.enfermero.nombreCompleto
            : "Sin asignar";
 
    document.getElementById("detallePaciente").textContent = nombreInterno;
    document.getElementById("detalleInterno").textContent = `Interno #${String(solicitud.internoID).padStart(4, "0")}`;
    document.getElementById("detalleEdad").textContent = calcularEdad(fechaNacimiento);
    document.getElementById("detalleEspecialidad").textContent = nombreEspecialidad;
    document.getElementById("detalleMotivo").textContent =solicitud.motivo || "Sin información";

    const detalleDiagnostico = document.getElementById("detalleDiagnostico");
    if (detalleDiagnostico) {
        detalleDiagnostico.textContent =solicitud.diagnostico || "Sin diagnóstico";
    }

    document.getElementById("detalleObservaciones").textContent = solicitud.observaciones || "Sin observaciones";
    document.getElementById("detalleEnfermero").textContent = nombreEnfermero;
}

async function cargarEspecialistas(
    especialidadId
) {
    const select = document.getElementById("medicoEspecialista");
    select.innerHTML = `
        <option value="">
            Cargando especialistas...
        </option>
    `;

    if (!especialidadId) {
        select.innerHTML = `
            <option value="">
                No hay especialidad asignada
            </option>
        `;
        return;
    }
    try {
        const respuesta = await fetch(`${API}/especialistas?especialidadId=${especialidadId}`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los especialistas.");
        }
        const especialistas = await respuesta.json();
        select.innerHTML = `
            <option value="">
                Seleccionar especialista
            </option>
        `;

        if (
            especialistas.length === 0
        ) {
            select.innerHTML = `
                <option value="">
                    No hay especialistas disponibles
                </option>
            `;
            return;
        }

        especialistas.forEach(
            function (especialista) {
                const option = document.createElement("option");
                option.value = especialista.id;
                option.textContent = `${especialista.nombreCompleto} — ${especialista.especialidad}`;
                select.appendChild(option);
            }
        );
    } catch (error) {
        console.error(error);
        select.innerHTML = `
            <option value="">
                Error al cargar especialistas
            </option>
        `;
    }
}

async function confirmarProgramacion() {
    if (!solicitudSeleccionada) {
        return;
    }
    const especialistaID = document.getElementById("medicoEspecialista").value;
    const fecha = document.getElementById("fechaAtencion").value;
    const hora = document.getElementById("horaAtencion").value;
    if (!especialistaID) {
        alert("Seleccione un médico especialista.");
        return;
    }
    if (!fecha) {
        alert("Seleccione una fecha.");
        return;
    }
    if (!hora) {
        alert(
            "Seleccione una hora."
        );
        return;
    }
    const fechaHora = `${fecha}T${hora}:00`;
    const boton = document.getElementById("btnConfirmar");
    boton.disabled = true;
    boton.innerHTML = `
        <i class="ph ph-spinner"></i>
        Programando...
    `;

    try {
        const respuesta =
            await fetch(
                `${API}/solicitudes/${solicitudSeleccionada.id}/programar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        especialistaID:parseInt(especialistaID),
                        fechaHora:fechaHora
                    })
                }
            );

        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No se pudo programar la solicitud."
            );
        }
        alert("La cita fue programada correctamente.");
        cerrarSolicitud();
        await cargarSolicitudes();
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        boton.disabled = false;
        boton.innerHTML = `
            <i class="ph ph-calendar-check"></i>
            Confirmar programación
        `;
    }
}

// CERRAR MODAL
function cerrarSolicitud() {
    document.getElementById("modalSolicitud").classList.remove("show");
    solicitudSeleccionada = null;

    document.getElementById(
        "medicoEspecialista"
    ).innerHTML = `
        <option value="">
            Seleccionar especialista
        </option>
    `;

    document.getElementById("fechaAtencion").value = "";
    document.getElementById("horaAtencion").value = "";
}

// CALCULAR EDAD
function calcularEdad(
    fechaNacimiento
) {
    if (!fechaNacimiento) {
        return "No registrada";
    }
    const nacimiento =new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (
        mes < 0 ||
        (
            mes === 0 && hoy.getDate() < nacimiento.getDate()
        )
    ) {
        edad--;
    }
    return `${edad} años`;
}

function formatearFecha(
    fecha
) {
    if (!fecha) {
        return "-";
    }
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function escapeHtml(texto) {
    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// NOTIFICACIONES
async function cargarNotificacionesFundacion() {
    try {
        const respuesta = await fetch(`${API}/solicitudes`);
        if (!respuesta.ok) {
            return;
        }

        const solicitudesActuales = await respuesta.json();
        const solicitudesPendientes = solicitudesActuales.filter(solicitud => solicitud.estado && solicitud.estado.toLowerCase() === "pendiente");
        solicitudesNotificacion = solicitudesPendientes;
        mostrarNotificacionesFundacion();
    } catch (error) {
        console.error("Error al cargar notificaciones:", error);
    }
}

function mostrarNotificacionesFundacion() {
    const lista = document.getElementById("notificationList");
    const dot = document.getElementById("notificationDot");
    const contador = document.getElementById("notificationCount");
    const vistas = JSON.parse(localStorage.getItem(NOTIFICACIONES_FUNDACION) || "[]");
    
    const nuevas = solicitudesNotificacion.filter(solicitud => !vistas.includes(solicitud.id));
    if (nuevas.length > 0) {
        dot.style.display = "block";
        contador.textContent =
            nuevas.length === 1
                ? "1 solicitud nueva"
                : `${nuevas.length} solicitudes nuevas`;
    } else {
        dot.style.display = "none";
        contador.textContent = "No hay notificaciones nuevas";
    }
    lista.innerHTML = "";
    if (nuevas.length === 0) {
        lista.innerHTML = `
            <div class="notification-empty">
                No hay solicitudes nuevas.
            </div>
        `;
        return;
    }
    nuevas.forEach(solicitud => {
        const nombreInterno = solicitud.interno
                ? solicitud.interno.nombreCompleto
                : "Un interno";
        const especialidad = solicitud.especialidad
                ? solicitud.especialidad.nombre
                : "especialidad médica";
        const item = document.createElement("div");
        item.className = "notification-item";
        item.style.cursor = "pointer";

        item.addEventListener(
            "click",
            async function () {
                const panel = document.getElementById("notificationPanel");
                panel.classList.remove("show");
                await abrirSolicitud(solicitud.id);
            }
        );
        item.innerHTML = `
            <div class="notification-item-icon">
                <i class="ph ph-clipboard-text"></i>
            </div>

            <div class="notification-item-content">
                <strong>
                    Nueva solicitud médica
                </strong>

                <span>
                    ${escapeHtml(nombreInterno)}
                    requiere atención de
                    ${escapeHtml(especialidad)}.
                </span>
            </div>
        `;
        lista.appendChild(item);
    });
}

function toggleNotificaciones() {
    const panel = document.getElementById("notificationPanel");
    
    const estaAbierto = panel.classList.contains("show");
    if (estaAbierto) {
        panel.classList.remove("show");
        marcarNotificacionesComoVistas();
        return;
    }
    panel.classList.add("show");
}

function marcarNotificacionesComoVistas() {
    const vistas = JSON.parse(localStorage.getItem(NOTIFICACIONES_FUNDACION) || "[]");
    solicitudesNotificacion.forEach(
        solicitud => {
            if (!vistas.includes(solicitud.id)) {
                vistas.push(solicitud.id);
            }
        }
    );
    localStorage.setItem(NOTIFICACIONES_FUNDACION, JSON.stringify(vistas));
    mostrarNotificacionesFundacion();
}