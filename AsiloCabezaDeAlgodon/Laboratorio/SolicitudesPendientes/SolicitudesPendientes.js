const API = "http://localhost:5054/api";
let atencionSeleccionada = null;
let examenesSeleccionados = [];
let solicitudesCargadas = [];
let notificacionesVistas = JSON.parse(localStorage.getItem("notificacionesLaboratorioVistas") || "[]");

function updateGreeting() {
    const greetingElement = document.getElementById("greeting");
    if (!greetingElement) {
        return;
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        greetingElement.textContent = "¡Buenos días!";
    } else if (currentHour >= 12 && currentHour < 18) {
        greetingElement.textContent = "¡Buenas tardes!";
    } else {
        greetingElement.textContent = "¡Buenas noches!";
    }
}

async function cargarSolicitudes() {
    const tbody = document.getElementById("solicitudesBody");
    if (!tbody) {
        return;
    }
    try {
        const respuesta = await fetch(`${API}/ExamenesLaboratorio/pendientes`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las solicitudes.");
        }

        const solicitudes = await respuesta.json();
        solicitudesCargadas = solicitudes || [];
        tbody.innerHTML = "";
        actualizarNotificaciones(solicitudesCargadas);
        if (!solicitudes || solicitudes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">
                        No hay solicitudes de laboratorio pendientes.
                    </td>
                </tr>
            `;
            actualizarPaginacion(0);
            return;
        }
        solicitudes.forEach(solicitud => {
            const examenes = solicitud.examenes || [];
            const listaExamenes = examenes.map(examen => `<span>${escapeHtml(examen.tipoExamen)}</span>`).join("");
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>
                    <div class="patient">
                        <div class="patient-avatar">
                            <i class="ph ph-user"></i>
                        </div>

                        <div>
                            <strong>
                                Interno #${escapeHtml(solicitud.internoId ?? "")}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    solicitud.internoNombre ?? "Sin nombre"
                                )}
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    <div class="exam-list">
                        ${listaExamenes}
                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        solicitud.medicoSolicitante ?? "No registrado"
                    )}
                </td>

                <td>
                    ${formatearFecha(solicitud.fechaAtencion)}
                </td>

                <td>
                    <span class="status pending">
                        Pendiente
                    </span>
                </td>

                <td>
                    <button
                        class="btn-process"
                        type="button"
                        onclick="abrirSolicitud(${solicitud.atencionId})">
                        <i class="ph ph-flask"></i>
                        Procesar solicitud
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
        actualizarPaginacion(solicitudes.length);
    } catch (error) {
        console.error(error);
        solicitudesCargadas = [];
        actualizarNotificaciones([]);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No se pudieron cargar las solicitudes.
                </td>
            </tr>
        `;
        actualizarPaginacion(0);
    }
}

async function abrirSolicitud(atencionId) {
    atencionSeleccionada = atencionId;
    const solicitud = solicitudesCargadas.find(item => item.atencionId === atencionId);
    if (solicitud) {
        const numero = document.getElementById("modalInternoNumero");
        const nombre = document.getElementById("modalInternoNombre");
        const informacion = document.getElementById("modalInformacionVisita");
        if (numero) {
            numero.textContent = `Interno #${solicitud.internoId ?? ""}`;
        }
        if (nombre) {
            nombre.textContent = solicitud.internoNombre ?? "Sin nombre";
        }
        if (informacion) {
            informacion.innerHTML = `
                <strong>Médico solicitante:</strong>
                ${escapeHtml(
                    solicitud.medicoSolicitante ?? "No registrado"
                )}
                <br>
                <strong>Fecha de atención:</strong>
                ${formatearFecha(solicitud.fechaAtencion)}
            `;
        }
    }
    try {
        const respuesta = await fetch(`${API}/ExamenesLaboratorio/atencion/${atencionId}`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los exámenes.");
        }
        const datos = await respuesta.json();
        examenesSeleccionados = datos;
        mostrarDatosSolicitud(datos);
        const modal = document.getElementById("modalSolicitud");
        if (modal) {
            modal.classList.add("active");
        }
        cerrarNotificaciones();
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los datos de la solicitud.");
    }
}

function mostrarDatosSolicitud(examenes) {
    const contenedor = document.getElementById("modalExamenes");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    if (!examenes || examenes.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-exams">
                No hay exámenes registrados para esta solicitud.
            </div>
        `;
        return;
    }

    examenes.forEach(examen => {
        const examItem = document.createElement("div");
        examItem.className = "exam-item";
        examItem.innerHTML = `
            <div class="exam-icon">
                <i class="ph ph-flask"></i>
            </div>

            <div class="exam-item-content">
                <strong class="exam-item-title">
                    ${escapeHtml(examen.tipoExamen)}
                </strong>

                <span class="exam-item-indications">
                    ${escapeHtml(
                        examen.indicaciones ||
                        "Sin indicaciones especiales."
                    )}
                </span>

                <div class="exam-cost">
                    <label>
                        Costo del examen
                    </label>

                    <div class="exam-cost-input">
                        <span>Q</span>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            data-examen-id="${examen.id}"
                            placeholder="0.00"
                            value="${examen.costo ?? ""}">
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(examItem);
    });
}

async function procesarSolicitud() {
    if (!atencionSeleccionada) {
        alert("No se encontró la atención médica.");
        return;
    }

    const inputs = document.querySelectorAll("#modalExamenes .exam-cost-input input");
    if (inputs.length === 0) {
        alert("No hay exámenes para procesar.");
        return;
    }

    const examenes = [];
    for (const input of inputs) {
        const examenId = parseInt(input.dataset.examenId);
        const costo = parseFloat(input.value);
        if (!costo || costo <= 0) {
            alert("Debe ingresar un costo válido para todos los exámenes.");
            input.focus();
            return;
        }
        examenes.push({id: examenId,costo: costo});
    }
    try {
        const respuesta = await fetch(
            `${API}/ExamenesLaboratorio/procesar/${atencionSeleccionada}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    examenes: examenes
                })
            }
        );

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            alert(
                datos.mensaje || "No se pudo procesar la solicitud."
            );
            return;
        }
        alert("La solicitud fue procesada correctamente.");
        cerrarSolicitud();
        cargarSolicitudes();
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al procesar la solicitud.");
    }
}

function cerrarSolicitud() {
    const modal = document.getElementById("modalSolicitud");
    if (modal) {
        modal.classList.remove("active");
    }
    atencionSeleccionada = null;
    examenesSeleccionados = [];
}

function actualizarPaginacion(cantidad) {
    const texto = document.getElementById("paginationInfo");
    if (!texto) {
        return;
    }
    texto.textContent = `Mostrando ${cantidad} solicitudes`;
}

function configurarBuscador() {
    const input = document.getElementById("buscarInterno");
    if (!input) {
        return;
    }
    input.addEventListener("input", function() {
        const texto = this.value.toLowerCase().trim();
        const filas = document.querySelectorAll("#solicitudesBody tr");

        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();
            fila.style.display = contenido.includes(texto)
                ? ""
                : "none";
        });
    });
}

function configurarNotificaciones() {
    const boton = document.getElementById("btnNotificaciones");
    if (!boton) {
        return;
    }

    boton.addEventListener("click", function(event) {
        event.stopPropagation();
        const panel = document.getElementById("notificationPanel");
        if (!panel) {
            return;
        }

        const seEstaAbriendo = !panel.classList.contains("active");
        panel.classList.toggle("active");
        if (seEstaAbriendo) {
            marcarNotificacionesComoVistas();
        }
    });

    document.addEventListener("click", function(event) {
        const wrapper = document.querySelector(".notification-wrapper");
        if (
            wrapper && !wrapper.contains(event.target)
        ) {
            cerrarNotificaciones();
        }
    });
}

function marcarNotificacionesComoVistas() {
    if (!solicitudesCargadas || solicitudesCargadas.length === 0) {
        return;
    }

    notificacionesVistas = solicitudesCargadas.map(solicitud => solicitud.atencionId);
    localStorage.setItem("notificacionesLaboratorioVistas",JSON.stringify(notificacionesVistas));
    const dot = document.getElementById("notificationDot");
    if (dot) {
        dot.classList.remove("active");
    }

    const lista = document.getElementById("notificationList");
    if (lista) {
        lista.innerHTML = `
            <div class="notification-empty">
                <i class="ph ph-check-circle"></i>
                <span>
                    No tienes notificaciones nuevas.
                </span>
            </div>
        `;
    }

    const contador = document.getElementById("notificationCount");
    if (contador) {
        contador.textContent = "Todo revisado";
    }
}

function actualizarNotificaciones(solicitudes) {
    const dot = document.getElementById("notificationDot");
    const lista = document.getElementById("notificationList");
    const contador = document.getElementById("notificationCount");
    if (!dot || !lista || !contador) {
        return;
    }

    lista.innerHTML = "";
    const nuevasSolicitudes = solicitudes.filter(
        solicitud =>
            !notificacionesVistas.includes(solicitud.atencionId)
    );

    if (nuevasSolicitudes.length > 0) {
        dot.classList.add("active");
    } else {
        dot.classList.remove("active");
    }

    contador.textContent =
        nuevasSolicitudes.length === 1
            ? "1 solicitud nueva"
            : `${nuevasSolicitudes.length} solicitudes nuevas`;
    if (nuevasSolicitudes.length === 0) {
        lista.innerHTML = `
            <div class="notification-empty">
                <i class="ph ph-check-circle"></i>
                <span>
                    No tienes notificaciones nuevas.
                </span>
            </div>
        `;
        return;
    }

    nuevasSolicitudes.forEach(solicitud => {
        const cantidadExamenes = solicitud.examenes?.length || 0;
        const item = document.createElement("button");
        item.type = "button";
        item.className = "notification-item";
        item.innerHTML = `
            <div class="notification-icon">
                <i class="ph ph-flask"></i>
            </div>

            <div class="notification-content">
                <strong>
                    Solicitud de laboratorio
                </strong>

                <span>
                    ${escapeHtml(
                        solicitud.internoNombre || "Interno"
                    )}
                </span>

                <small>
                    ${cantidadExamenes}
                    ${cantidadExamenes === 1
                        ? "examen pendiente"
                        : "exámenes pendientes"}
                </small>
            </div>
            <i class="ph ph-caret-right notification-arrow"></i>
        `;
        lista.appendChild(item);
    });
}

function cerrarNotificaciones() {
    const panel = document.getElementById("notificationPanel");
    if (panel) {
        panel.classList.remove("active");
    }
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj)) {
        return fecha;
    }
    return fechaObj.toLocaleDateString("es-GT");
}

function escapeHtml(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        updateGreeting();
        configurarBuscador();
        configurarNotificaciones();
        cargarSolicitudes();
    }
);