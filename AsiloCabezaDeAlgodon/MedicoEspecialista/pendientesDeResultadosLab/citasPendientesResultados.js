const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let citas = [];
let citasPendientesResultados = [];
let paginaPendientes = 1;
const registrosPorPagina = 10;

document.addEventListener("DOMContentLoaded", () => {
    cargarCitasPendientesResultados();
    configurarNotificaciones();
});


async function cargarCitasPendientesResultados() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        console.error("No existe usuarioId.");
        return;
    }
    try {
        console.log(
            "Cargando citas del especialista:", usuarioId
        );

        const respuesta = await fetch(`${API}/Citas/especialista/${usuarioId}`);
        if (!respuesta.ok) {
            throw new Error(`No se pudieron cargar las citas. Código HTTP: ${respuesta.status}`);
        }
        citas = await respuesta.json();
        if (!Array.isArray(citas)) {
            citas = [];
        }
        console.log("Citas recibidas:", citas);
        cargarPerfilMedico();
        await obtenerCitasConResultados();
        mostrarTabla();
        prepararNotificaciones();

    }
    catch (error) {
        console.error("ERROR AL CARGAR CITAS:",error);
        mostrarErrorTabla();
    }
}

function cargarPerfilMedico() {
    if (citas.length === 0) {
        return;
    }

    const especialista = citas.find(cita => cita.especialista)?.especialista;
    if (!especialista) {
        return;
    }

    const nombre = especialista.nombreCompleto || especialista.nombreUsuario || "Médico especialista";
    const especialidad = citas.find(cita => cita.solicitud?.especialidad?.nombre)?.solicitud?.especialidad?.nombre || "Especialista";
    const nombreSidebar = document.getElementById("nombreMedicoSidebar");
    const nombreTop = document.getElementById("nombreMedicoTop");
    const especialidadSidebar = document.getElementById("especialidadMedicoSidebar");
    const especialidadTop = document.getElementById("especialidadMedicoTop");

    if (nombreSidebar) {
        nombreSidebar.textContent = nombre;
    }
    if (nombreTop) {
        nombreTop.textContent = nombre;
    }
    if (especialidadSidebar) {
        especialidadSidebar.textContent = especialidad;
    }
    if (especialidadTop) {
        especialidadTop.textContent = especialidad;
    }
}

async function obtenerCitasConResultados() {
    citasPendientesResultados = [];
    for (const cita of citas) {
        try {
            const respuesta = await fetch(`${API}/Atenciones/cita/${cita.id}`);
            if (!respuesta.ok) {
                continue;
            }

            const data = await respuesta.json();
            if (!data.existe || !data.atencion) {
                continue;
            }

            const examenes = data.atencion.examenesLaboratorio || [];
            if (examenes.length === 0) {
                continue;
            }

            const todosCompletados = examenes.every(examen => examen.estado && examen.estado.toLowerCase() === "completado");
            if (!todosCompletados) {
                continue;
            }
            if (data.atencion.diagnosticoFinal) {
                continue;
            }

            const yaExiste = citasPendientesResultados.some(item => item.cita.id === cita.id);
            if (!yaExiste) {
                citasPendientesResultados.push({
                    cita: cita,
                    atencion: data.atencion,
                    cantidadExamenes: examenes.length
                });
            }
        }
        catch (error) {
            console.error(`Error al consultar la cita ${cita.id}:`, error);
        }
    }
    actualizarContadores();
}

function actualizarContadores() {
    const cantidad = citasPendientesResultados.length;
    const texto = document.getElementById("textoCantidadPendientes");
    if (texto) {
        texto.textContent =
            `${cantidad} ${
                cantidad === 1
                    ? "resultado por revisar"
                    : "resultado por revisar"
            }`;
    }

    const badge = document.getElementById("badgeResultadosPendientes");
    if (badge) {
        badge.textContent = cantidad;
    }

    const badgeCitas = document.getElementById("badgeCitasPendientes");
    if (badgeCitas) {
        badgeCitas.textContent = citas.filter(cita => cita.estado === "Programada").length;
    }
}

function mostrarTabla() {
    const tbody = document.getElementById("tablaCitasPendientesResultados");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = "";

    const inicio = (paginaPendientes - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const pagina = citasPendientesResultados.slice(inicio, fin);
    if (pagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-table"
                >
                    No hay citas pendientes de resultados.
                </td>
            </tr>
        `;
        actualizarPaginacion();
        return;
    }

    pagina.forEach(item => {
        const cita = item.cita;
        const atencion = item.atencion;
        const fecha = new Date(cita.fechaHora);
        const fechaTexto = fecha.toLocaleDateString("es-GT");
        const horaTexto = fecha.toLocaleTimeString("es-GT",
                {
                    hour: "numeric", minute: "2-digit"
                }
            );
        const nombrePaciente = cita.interno
                ? `${cita.interno.nombre} ${cita.interno.apellido}`
                : "Sin paciente";
        const motivo = cita.motivo || cita.solicitud?.motivo || "Sin motivo";
        const cantidadExamenes = item.cantidadExamenes;
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>
                ${fechaTexto}
            </td>

            <td>
                ${horaTexto}
            </td>

            <td>
                <strong>
                    ${nombrePaciente}
                </strong>
            </td>

            <td>
                ${motivo}
            </td>

            <td>
                <span class="exam-count">
                    ${cantidadExamenes}
                    ${
                        cantidadExamenes === 1
                            ? "examen"
                            : "exámenes"
                    }
                </span>
            </td>

            <td>
                <span class="status-badge pending">
                    Pendiente de revisión
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn-view"
                    onclick="abrirSegundaAtencion(${cita.id})"
                >
                    <i class="ph ph-eye"></i>
                    Ver resultados
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    actualizarPaginacion();
}

function mostrarErrorTabla() {
    const tbody = document.getElementById("tablaCitasPendientesResultados");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="empty-table"
            >
                No se pudieron cargar las citas.
            </td>
        </tr>
    `;
}

function actualizarPaginacion() {
    const contenedor = document.getElementById("paginacionPendientes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";

    const totalRegistros = citasPendientesResultados.length;
    if (totalRegistros === 0) {
        return;
    }

    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaPendientes - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaPendientes * registrosPorPagina, totalRegistros);
    const informacion = document.createElement("span");
    informacion.className = "pagination-info";
    informacion.textContent = `Mostrando ${inicio} - ${fin} de ${totalRegistros} citas`;
    const controles = document.createElement("div");
    controles.className = "pagination-controls";
    const anterior = document.createElement("button");
    anterior.type = "button";
    anterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    anterior.disabled = paginaPendientes === 1;
    anterior.onclick = () => {
        paginaPendientes--;
        mostrarTabla();
    };

    controles.appendChild(anterior);
    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = pagina;
        if (
            pagina === paginaPendientes
        ) {
            boton.classList.add("active");
        }

        boton.onclick = () => {
            paginaPendientes = pagina;
            mostrarTabla();
        };
        controles.appendChild(boton);
    }

    const siguiente = document.createElement("button");
    siguiente.type = "button";
    siguiente.innerHTML = `<i class="ph ph-caret-right"></i>`;
    siguiente.disabled = paginaPendientes === totalPaginas;
    siguiente.onclick = () => {
        paginaPendientes++;
        mostrarTabla();
    };
    controles.appendChild(siguiente);
    contenedor.appendChild(
        informacion
    );
    contenedor.appendChild(
        controles
    );
}

function prepararNotificaciones() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        return;
    }

    const clave = `notificacionesEspecialistaResultados_${usuarioId}`;
    let vistas = [];
    try {
        vistas = JSON.parse(localStorage.getItem(clave)) || [];
    }
    catch {
        vistas = [];
    }
    const nuevas = citasPendientesResultados.filter(item => !vistas.includes(item.cita.id));
    renderizarNotificaciones(nuevas);
}

function renderizarNotificaciones(
    nuevas
) {
    const lista = document.getElementById("listaNotificaciones");
    const contador = document.getElementById("contadorNotificaciones");
    const punto = document.getElementById("notificationDot");
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

    if (punto) {
        punto.style.display =
            nuevas.length > 0
                ? "block"
                : "none";
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
    nuevas.forEach(item => {
        const cita = item.cita;
        const paciente = cita.interno
                ? `${cita.interno.nombre} ${cita.interno.apellido}`
                : "Interno";
        const cantidad = item.cantidadExamenes;
        const notificacion = document.createElement("button");
        notificacion.type = "button";
        notificacion.className = "notificacion-item";
        notificacion.innerHTML = `
            <div class="notificacion-icon">
                <i class="ph ph-test-tube"></i>
            </div>

            <div class="notificacion-text">
                <strong>
                    Resultados de laboratorio
                </strong>

                <span>
                    ${paciente}
                </span>

                <small>
                    ${cantidad}
                    ${
                        cantidad === 1
                            ? "examen listo"
                            : "exámenes listos"
                    }
                </small>
            </div>
        `;
        notificacion.addEventListener(
            "click",
            () => {
                marcarUnaNotificacionVista(cita.id);
            }
        );
        lista.appendChild(notificacion);
    });
}

function marcarUnaNotificacionVista(
    citaId
) {
    const usuarioId = localStorage.getItem("usuarioId");
    const clave = `notificacionesEspecialistaResultados_${usuarioId}`;
    let vistas = [];
    try {
        vistas = JSON.parse(localStorage.getItem(clave)) || [];
    }
    catch {
        vistas = [];
    }
    if (
        !vistas.includes(citaId)
    ) {
        vistas.push(citaId);
    }
    localStorage.setItem(clave, JSON.stringify(vistas));
    prepararNotificaciones();
}

function marcarNotificacionesVistas() {
    const usuarioId = localStorage.getItem("usuarioId");
    const clave = `notificacionesEspecialistaResultados_${usuarioId}`;
    const ids = citasPendientesResultados.map(item => item.cita.id);
    localStorage.setItem(clave, JSON.stringify(ids));
    prepararNotificaciones();
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
    }
    else {
        panel.style.display = "block";
    }
}

function configurarNotificaciones() {
    const boton = document.getElementById("btnNotificaciones");
    const panel = document.getElementById("panelNotificaciones");
    if (!boton || !panel) {
        return;
    }

    boton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            mostrarPanelNotificaciones();
        }
    );

    panel.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );

    document.addEventListener(
        "click",
        () => {
            panel.style.display = "none";
        }
    );
    
    const botonMarcar = document.getElementById("btnMarcarNotificaciones");
    if (botonMarcar) {
        botonMarcar.addEventListener("click", marcarNotificacionesVistas);
    }
}

function abrirSegundaAtencion(citaId) {
    if (!citaId) {
        alert("No se encontró la cita.");
        return;
    }
    window.location.href = `../MisCitas/atenderPaciente.html?id=${citaId}`;
}