const API_BASE = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let usuarioId = null;
let enfermeroActual = null;
let asignaciones = [];
let asignacionesFiltradas = [];

document.addEventListener("DOMContentLoaded",
    async function () {
        usuarioId =localStorage.getItem("usuarioId");
        if (!usuarioId) {
            alert("No se encontró el usuario en la sesión.");
            return;
        }
        await cargarEnfermero();
        await cargarAsignaciones();
        configurarEventos();
        mostrarGreeting();
    }
);

async function cargarEnfermero() {
    try {
        const respuesta = await fetch(`${API_BASE}/api/Enfermero/${usuarioId}`);
        if (!respuesta.ok) {
            const resultado = await respuesta.json();
            throw new Error(resultado.mensaje || "No se pudo cargar el enfermero.");
        }
        enfermeroActual = await respuesta.json();
    
        const nombreSidebar = document.getElementById("nombreEnfermeroSidebar");
        if (nombreSidebar) {
            nombreSidebar.textContent = enfermeroActual.nombreCompleto;
        }

        const nombreTop = document.getElementById("nombreEnfermeroTop");
        if (nombreTop) {
            nombreTop.textContent = enfermeroActual.nombreCompleto;
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function cargarAsignaciones() {
    try {
        const respuesta = await fetch(`${API_BASE}/api/Enfermero/${usuarioId}/asignaciones`);
        if (!respuesta.ok) {
            const resultado = await respuesta.json();
            throw new Error(resultado.mensaje || "No se pudieron cargar las asignaciones.");
        }

        const resultado = await respuesta.json();
        asignaciones = resultado.asignaciones || [];
        asignacionesFiltradas = [...asignaciones];
        renderizarAsignaciones();
        renderizarProximosAcompanamientos();
        actualizarContador();
        prepararNotificaciones();
    } catch (error) {
        console.error(error);
        mostrarErrorAsignaciones(error.message);
    }
}

function renderizarAsignaciones() {
    const panel = document.querySelector(".assignments-panel");
    if (!panel) {
        return;
    }

    panel.querySelectorAll(
        ".assignment-card, .assignment-empty"
    ).forEach(
        elemento => elemento.remove()
    );

    if (asignacionesFiltradas.length === 0) {
        const vacio = document.createElement("div");
        vacio.className = "assignment-empty";
        vacio.innerHTML = `
            <i class="ph ph-clipboard-text"></i>
            <h3>
                No se encontraron asignaciones
            </h3>

            <p>
                No existen asignaciones que coincidan con los filtros seleccionados.
            </p>
        `;
        panel.appendChild(vacio);
        return;
    }

    asignacionesFiltradas.forEach(
        function (asignacion) {
            const tarjeta = crearTarjetaAsignacion(asignacion);
            panel.appendChild(tarjeta);
        }
    );
}

function crearTarjetaAsignacion(
    asignacion
) {
    const tarjeta =document.createElement("div");
    tarjeta.className ="assignment-card";
    const interno =asignacion.interno;
    const especialidad = asignacion.especialidad;
    const especialista = asignacion.especialista;
    const nombreInterno = interno
            ? interno.nombreCompleto
            : "Interno no disponible";
    const numeroInterno = interno
            ? `Interno #${interno.id}`
            : "Interno";
    const edad = interno
            ? calcularEdad(interno.fechaNacimiento): "-";
    const estado =obtenerEstadoAsignacion(asignacion);
    const fecha = obtenerFechaCita(asignacion);
    const especialistaNombre = especialista
            ? especialista.nombreCompleto
            : "Pendiente de asignar";

    tarjeta.innerHTML = `
        <div class="assignment-main">
            <div class="patient-avatar">
                <i class="ph ph-user"></i>
            </div>

            <div class="patient-info">
                <span class="patient-id">
                    ${numeroInterno}
                </span>

                <h3>
                    ${nombreInterno}
                </h3>

                <p>
                    ${
                        edad !== "-"
                            ? edad + " años"
                            : "Edad no disponible"
                    }
                </p>
            </div>
        </div>

        <div class="assignment-details">
            <div class="detail-item">
                <span>
                    Especialidad
                </span>

                <strong>
                    <i class="ph ph-heartbeat"></i>
                    ${
                        especialidad
                            ? especialidad.nombre
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item">
                <span>
                    Médico especialista
                </span>

                <strong>
                    ${especialistaNombre}
                </strong>
            </div>

            <div class="detail-item">
                <span>
                    Fecha y hora
                </span>

                <strong>
                    <i class="ph ph-calendar"></i>
                    ${
                        fecha
                            ? formatearFechaHora(
                                fecha
                            )
                            : "Pendiente"
                    }
                </strong>
            </div>
        </div>

        <div class="assignment-status">
            <span class="status ${claseEstado(estado)}">
                ${textoEstado(estado)}
            </span>

            <button
                type="button"
                class="btn-view"
                data-solicitud-id="${asignacion.solicitudId}"
            >
                <i class="ph ph-eye"></i>
                Ver detalles
            </button>
        </div>
    `;

    const boton =tarjeta.querySelector(".btn-view");
    if (boton) {
        boton.addEventListener(
            "click",
            function () {
                mostrarDetalles(asignacion.solicitudId);
            }
        );
    }
    return tarjeta;
}

function obtenerFechaCita(
    asignacion
) {
    if (
        !asignacion
    ) {
        return null;
    }

    if (
        asignacion.cita && asignacion.cita.fechaHora
    ) {
        return asignacion.cita.fechaHora;
    }
    return null;
}

function obtenerEstadoAsignacion(
    asignacion
) {
    if (
        asignacion.cita && asignacion.cita.estado
    ) {
        return asignacion.cita.estado.toLowerCase();
    }

    if (
        asignacion.estadoSolicitud
    ) {
        return asignacion.estadoSolicitud.toLowerCase();
    }
    return "pendiente";
}

function textoEstado(
    estado
) {
    switch (estado) {
        case "programada":
            return "Programada";

        case "completada":
            return "Completada";

        case "pendiente":
            return "Pendiente";

        case "cancelada":
            return "Cancelada";

        default:
            return estado || "Pendiente";
    }
}


function claseEstado(
    estado
) {
    switch (estado) {
        case "programada":
            return "scheduled";

        case "completada":
            return "completed";

        case "pendiente":
            return "pending";

        case "cancelada":
            return "cancelled";

        default:
            return "pending";
    }
}


function renderizarProximosAcompanamientos() {
    const lista =document.querySelector(".upcoming-list");
    if (!lista) {
        return;
    }
    lista.innerHTML = "";
    const ahora =new Date();
    const proximos =asignaciones
            .filter(
                asignacion =>
                    asignacion.cita &&
                    asignacion.cita.fechaHora &&
                    (
                        asignacion.cita.estado &&
                        asignacion.cita.estado.toLowerCase() === "programada"
                    )
            )

            .filter(
                asignacion =>
                    new Date(
                        asignacion.cita.fechaHora
                    ) >= ahora
            )

            .sort(
                (a, b) =>
                    new Date(
                        a.cita.fechaHora
                    ) -
                    new Date(
                        b.cita.fechaHora
                    )
            )
            .slice(0, 5);
    if (
        proximos.length === 0
    ) {

        lista.innerHTML = `
            <div class="upcoming-empty">
                <i class="ph ph-calendar-blank"></i>

                <p>
                    No tienes próximos acompañamientos programados.
                </p>
            </div>
        `;
        return;
    }

    proximos.forEach(
        function (asignacion) {
            const fecha =new Date(asignacion.cita.fechaHora);
            const tarjeta = document.createElement("div");
            tarjeta.className = "upcoming-card";
            const esHoy = esMismaFecha(fecha,new Date());

            tarjeta.innerHTML = `
                <div class="upcoming-date">
                    <strong>
                        ${
                            esHoy
                                ? "HOY"
                                : String(
                                    fecha.getDate()
                                ).padStart(
                                    2,
                                    "0"
                                )
                        }
                    </strong>

                    <span>
                        ${
                            esHoy
                                ? formatearHora(fecha)
                                : obtenerMes(fecha)
                        }
                    </span>
                </div>

                <div class="upcoming-info">
                    <strong>
                        ${
                            asignacion.interno
                                ? asignacion.interno
                                    .nombreCompleto
                                : "Interno"
                        }
                    </strong>

                    <span>
                        ${
                            asignacion.especialidad
                                ? asignacion.especialidad
                                    .nombre
                                : "-"
                        }
                        ·
                        ${
                            formatearHora(fecha)
                        }
                    </span>
                </div>

                <span class="status scheduled">
                    Programada
                </span>
            `;
            lista.appendChild(
                tarjeta
            );

        }
    );
}

function actualizarContador() {
    const contador =document.querySelector(".results-count");
    if (!contador) {
        return;
    }

    contador.textContent =
        `${asignacionesFiltradas.length} ${
            asignacionesFiltradas.length === 1
                ? "asignación"
                : "asignaciones"
        }`;
}

function configurarEventos() {
    const buscar = document.getElementById("buscar");
    if (buscar) {
        buscar.addEventListener("input",aplicarFiltros);
    }

    const estado = document.getElementById("estado");
    if (estado) {
        estado.addEventListener("change",aplicarFiltros);
    }

    const fecha = document.getElementById("fecha");
    if (fecha) {
        fecha.addEventListener("change",aplicarFiltros);
    }

    const btnNotificacion = document.getElementById("btnNotificacion");
    if (btnNotificacion) {
        btnNotificacion.addEventListener(
            "click",
            function () {
                mostrarPanelNotificaciones();
            }
        );
    }

    const btnMarcar =document.getElementById("btnMarcarNotificaciones");
    if (btnMarcar) {
        btnMarcar.addEventListener("click",marcarNotificacionesVistas);
    }

    const cerrar =document.getElementById("btnCerrarDetalles");
    if (cerrar) {
        cerrar.addEventListener("click",cerrarModalDetalles);
    }

    const cerrarFooter =document.getElementById("btnCerrarDetallesFooter");
    if (cerrarFooter) {
        cerrarFooter.addEventListener("click",cerrarModalDetalles);
    }

    window.addEventListener(
        "click",
        function (event) {
            const modal =document.getElementById("modalDetalles");
            if (
                modal && event.target === modal
            ) {
                cerrarModalDetalles();
            }
        }
    );

    document.addEventListener(
        "click",
        function (event) {
            const panel = document.getElementById("panelNotificaciones");
            const boton = document.getElementById("btnNotificacion");
            if (
                panel && boton &&
                !panel.contains(event.target) && !boton.contains(event.target)
            ) {
                panel.style.display = "none";
            }
        }
    );
}

function aplicarFiltros() {
    const texto = (document.getElementById("buscar")?.value || "").trim().toLowerCase();
    const estado = (document.getElementById("estado")?.value || "").toLowerCase();
    const fecha = document.getElementById("fecha")?.value || "";
    asignacionesFiltradas = asignaciones.filter(function (asignacion) {
            const nombre = asignacion.interno?.nombreCompleto
                    ?.toLowerCase() || "";
            const numero = String(asignacion.interno?.id || "").toLowerCase();
            const coincideTexto = !texto || nombre.includes(texto) || numero.includes(texto);
            const estadoAsignacion = obtenerEstadoAsignacion(asignacion);
            const coincideEstado = !estado || estadoAsignacion === estado;
            let coincideFecha = true;
            if (fecha) {
                if (
                    !asignacion.cita || !asignacion.cita.fechaHora
                ) {
                    coincideFecha = false;
                } else {
                    const fechaCita = new Date(asignacion.cita.fechaHora);
                    const fechaTexto = fechaCita.toISOString().split("T")[0];
                    coincideFecha = fechaTexto === fecha;
                }
            }
            return (
                coincideTexto && coincideEstado && coincideFecha
            );
        });
    renderizarAsignaciones();
    actualizarContador();
}

async function mostrarDetalles(
    solicitudId
) {
    const modal = document.getElementById("modalDetalles");
    const contenido = document.getElementById( "contenidoDetalles");
    if (!modal || !contenido) {
        return;
    }
    modal.style.display ="flex";
    contenido.innerHTML = `
        <div class="detalle-cargando">
            <i class="ph ph-spinner"></i>

            <p>
                Cargando detalles...
            </p>
        </div>
    `;

    try {
        const respuesta = await fetch(`${API_BASE}/api/Enfermero/${usuarioId}/asignaciones/${solicitudId}`);
        if (!respuesta.ok) {
            const resultado = await respuesta.json();
            throw new Error(resultado.mensaje || "No se pudieron cargar los detalles.");
        }

        const detalle = await respuesta.json();
        const interno = detalle.interno;
        const especialidad = detalle.especialidad;
        const especialista = detalle.especialista;
        const cita = detalle.cita;
        const estado = cita && cita.estado
                ? cita.estado.toLowerCase()
                : (
                    detalle.estado
                        ? detalle.estado.toLowerCase()
                        : "pendiente"
                );

        contenido.innerHTML = `
            <div class="detalle-grid">
                <div class="detalle-bloque">
                    <span>
                        Interno
                    </span>

                    <strong>
                        ${
                            interno
                                ? interno.nombreCompleto
                                : "-"
                        }
                    </strong>

                    <small>
                        ${
                            interno
                                ? `Interno #${interno.id}`
                                : ""
                        }
                    </small>
                </div>

                <div class="detalle-bloque">
                    <span>
                        Edad
                    </span>

                    <strong>
                        ${
                            interno
                                ? calcularEdad(
                                    interno.fechaNacimiento
                                ) + " años"
                                : "-"
                        }
                    </strong>
                </div>

                <div class="detalle-bloque">
                    <span>
                        Especialidad
                    </span>

                    <strong>
                        ${
                            especialidad
                                ? especialidad.nombre
                                : "-"
                        }
                    </strong>
                </div>

                <div class="detalle-bloque">
                    <span>
                        Médico especialista
                    </span>

                    <strong>
                        ${
                            especialista
                                ? especialista.nombreCompleto
                                : "Pendiente de asignar"
                        }
                    </strong>
                </div>

                <div class="detalle-bloque">
                    <span>
                        Fecha y hora
                    </span>

                    <strong>
                        ${
                            cita
                                ? formatearFechaHora(
                                    cita.fechaHora
                                )
                                : "Pendiente"
                        }
                    </strong>
                </div>

                <div class="detalle-bloque">
                    <span>
                        Estado
                    </span>

                    <strong>
                        <span class="status ${claseEstado(estado)}">
                            ${textoEstado(estado)}
                        </span>
                    </strong>
                </div>

                <div class="detalle-bloque detalle-completo">
                    <span>
                        Motivo
                    </span>

                    <p>
                        ${
                            detalle.motivo || "-"
                        }
                    </p>
                </div>

                <div class="detalle-bloque detalle-completo">
                    <span>
                        Observaciones
                    </span>

                    <p>
                        ${
                            detalle.observaciones || "-"
                        }
                    </p>
                </div>
            </div>
        `;
        cerrarNotificaciones();
    } catch (error) {
        console.error(error);

        contenido.innerHTML = `
            <div class="detalle-error">
                <i class="ph ph-warning-circle"></i>

                <p>
                    ${error.message}
                </p>
            </div>
        `;
    }
}

function cerrarModalDetalles() {
    const modal = document.getElementById("modalDetalles");
    if (modal) {
        modal.style.display = "none";
    }
}

function prepararNotificaciones() {
    const clave = `notificacionesEnfermero_${usuarioId}`;
    let vistas = [];

    try {
        vistas =JSON.parse(localStorage.getItem(clave)) || [];
    } catch {
        vistas = [];
    }

    const nuevas =
        asignaciones.filter(
            function (asignacion) {
                if (
                    !asignacion.cita || !asignacion.cita.id
                ) {
                    return false;
                }

                const estado = asignacion.cita.estado ? asignacion.cita.estado.toLowerCase() : "";
                if (
                    estado !== "programada"
                ) {
                    return false;
                }
                return !vistas.includes(asignacion.cita.id);
            }
        );

    const dot =document.getElementById("notificationDot");
    if (dot) {
        dot.style.display =
            nuevas.length > 0
                ? "block"
                : "none";
    }
    renderizarNotificaciones(nuevas);
}

function mostrarPanelNotificaciones() {
    const panel = document.getElementById("panelNotificaciones");
    if (!panel) {
        return;
    }
    if (
        panel.style.display === "block"
    ) {
        panel.style.display = "none";
        return;
    }
    panel.style.display =
        "block";
}

function renderizarNotificaciones(
    nuevas
) {
    const lista =document.getElementById("listaNotificaciones");
    const contador =document.getElementById("contadorNotificaciones");
    if (!lista) {
        return;
    }
    if (contador) {
        contador.textContent =
            `${nuevas.length} ${
                nuevas.length === 1
                    ? "nueva"
                    : "nuevas"
            }`;
    }

    if (nuevas.length === 0) {
        lista.innerHTML = `
            <div class="notificacion-vacia">
                <i class="ph ph-check-circle"></i>

                <p>
                    No tienes notificaciones nuevas.
                </p>
            </div>
        `;
        return;
    }
    lista.innerHTML = "";

    nuevas.forEach(
        function (asignacion) {
            const item =document.createElement("button");
            item.type = "button";
            item.className = "notificacion-item";

            item.innerHTML = `
                <div class="notificacion-icon">
                    <i class="ph ph-calendar-check"></i>
                </div>

                <div class="notificacion-text">
                    <strong>
                        Nueva cita programada
                    </strong>

                    <span>
                        ${
                            asignacion.interno
                                ? asignacion.interno
                                    .nombreCompleto
                                : "Interno"
                        }
                    </span>

                    <small>
                        ${
                            asignacion.especialidad
                                ? asignacion.especialidad
                                    .nombre
                                : "-"
                        }
                        ·
                        ${
                            asignacion.cita
                                ? formatearFechaHora(asignacion.cita.fechaHora)
                                : "-"
                        }
                    </small>
                </div>
            `;

            item.addEventListener(
                "click",
                function () {
                    mostrarDetalles(asignacion.solicitudId);
                    marcarUnaNotificacionVista(asignacion.cita.id);
                }
            );
            lista.appendChild(item);
        }
    );
}

function marcarUnaNotificacionVista(
    citaId
) {
    const clave =`notificacionesEnfermero_${usuarioId}`;
    let vistas = [];

    try {
        vistas = JSON.parse(localStorage.getItem(clave)) || [];
    } catch {
        vistas = [];
    }

    if (!vistas.includes(citaId)) {
        vistas.push(citaId);
    }

    localStorage.setItem(clave,JSON.stringify(vistas));
    prepararNotificaciones();
}

function marcarNotificacionesVistas() {
    const clave = `notificacionesEnfermero_${usuarioId}`;
    const ids = asignaciones
            .filter(
                asignacion =>
                    asignacion.cita &&
                    asignacion.cita.id &&
                    asignacion.cita.estado &&
                    asignacion.cita.estado
                        .toLowerCase() === "programada"
            )
            .map(
                asignacion => asignacion.cita.id
            );
    localStorage.setItem(clave,JSON.stringify(ids));
    prepararNotificaciones();
}

function mostrarErrorAsignaciones(
    mensaje
) {
    const panel = document.querySelector(".assignments-panel");
    if (!panel) {
        return;
    }
    
    panel.innerHTML = `
        <div class="assignment-empty">
            <i class="ph ph-warning-circle"></i>

            <h3>
                No se pudieron cargar las asignaciones
            </h3>

            <p>
                ${mensaje}
            </p>
        </div>
    `;
}

function calcularEdad(
    fechaNacimiento
) {
    if (!fechaNacimiento) {
        return "-";
    }

    const nacimiento = new Date(fechaNacimiento);
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
    return edad;
}

function formatearFechaHora(
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
    ) +
    " · " +
    fechaObj.toLocaleTimeString(
        "es-GT",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatearHora(
    fecha
) {
    return new Date(
        fecha
    ).toLocaleTimeString(
        "es-GT",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function obtenerMes(
    fecha
) {
    return new Date(
        fecha
    )
        .toLocaleDateString(
            "es-GT",
            {
                month: "short"
            }
        )
        .replace(
            ".",""
        )
        .toUpperCase();
}

// COMPARAR FECHAS
function esMismaFecha(
    fecha1,
    fecha2
) {
    return (
        fecha1.getFullYear() ===
        fecha2.getFullYear() &&
        fecha1.getMonth() ===
        fecha2.getMonth() &&
        fecha1.getDate() ===
        fecha2.getDate()
    );
}

function mostrarGreeting() {
    const greeting = document.getElementById("greeting");
    if (!greeting) {
        return;
    }

    const hora = new Date().getHours();
    let saludo = "Buenos días";
    if (hora >= 12 && hora < 18) {
        saludo = "Buenas tardes";
    } else if (hora >= 18) {
        saludo = "Buenas noches";
    }

    const nombre = enfermeroActual
            ?.nombreCompleto || "";
    const primerNombre = nombre.split(" ")[0];
    greeting.textContent = `${saludo}, ${primerNombre}`;
}

function cerrarNotificaciones() {
    const panel =document.getElementById("panelNotificaciones");
    if (panel) {
        panel.style.display = "none";
    }
}