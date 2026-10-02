const API = "http://localhost:5054/api";
let recetas = [];
let recetasFiltradas = [];
let recetaSeleccionada = null;
let paginaActual = 1;
const registrosPorPagina = 5;
let notificacionesVistas = JSON.parse(localStorage.getItem("notificacionesFarmaciaVistas") || "[]");

document.addEventListener("DOMContentLoaded", () => {
    updateGreeting();
    configurarBuscador();
    configurarModal();
    configurarNotificaciones();
    cargarRecetas();
});

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

async function cargarRecetas() {
    const tbody = document.getElementById("entregasBody");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-message">
                Cargando recetas pendientes...
            </td>
        </tr>
    `;
    try {
        const respuesta = await fetch(`${API}/Recetas/pendientes`);
        if (!respuesta.ok) {
            const mensaje = await obtenerMensajeError(respuesta);
            throw new Error(mensaje);
        }
        recetas = await respuesta.json();
        recetasFiltradas = [...recetas];
        paginaActual = 1;
        actualizarNotificaciones(recetas);
        mostrarRecetas();
    } catch (error) {
        console.error("Error al cargar recetas:", error);
        recetas = [];
        recetasFiltradas = [];
        actualizarNotificaciones([]);

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    No se pudieron cargar las recetas pendientes.
                </td>
            </tr>
        `;
        actualizarPaginacion();
    }
}

function mostrarRecetas() {
    const tbody = document.getElementById("entregasBody");
    if (!tbody) {
        return;
    }
    tbody.innerHTML = "";

    if (recetasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    No hay recetas pendientes.
                </td>
            </tr>
        `;
        actualizarPaginacion();
        return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const recetasPagina = recetasFiltradas.slice(inicio, fin);
    
    recetasPagina.forEach(receta => {
        const fila = document.createElement("tr");
        const medicamentos = receta.detalles || [];
        const listaMedicamentos = medicamentos
            .map(medicamento => `
                <span>
                    ${escapeHtml(medicamento.medicamento)}
                    ${medicamento.dosis
                        ? ` - ${escapeHtml(medicamento.dosis)}`
                        : ""}
                </span>
            `)
            .join("");

        fila.innerHTML = `
            <td>
                <div class="patient">
                    <strong>
                        ${escapeHtml(
                            receta.internoNombre || "Sin nombre"
                        )}
                    </strong>
                    <span>
                        #${escapeHtml(receta.internoId ?? "")}
                    </span>
                </div>
            </td>

            <td>
                <div class="medicine-list">
                    ${
                        listaMedicamentos || "<span>Sin medicamentos</span>"
                    }
                </div>
            </td>

            <td>
                ${formatearFecha(receta.fechaReceta)}
            </td>

            <td>
                <span class="status pending">
                    Pendiente
                </span>
            </td>

            <td>
                <button
                    class="btn-delivery"
                    type="button"
                    onclick="abrirEntrega(${receta.id})"
                >
                    <i class="ph ph-hand-pointing"></i>
                    Registrar entrega
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const total = recetasFiltradas.length;
    const totalPaginas = Math.ceil(total / registrosPorPagina);
    const texto = document.getElementById("paginationInfo");
    const botones = document.getElementById("paginationButtons");

    if (texto) {
        if (total === 0) {
            texto.textContent = "Mostrando 0 de 0 entregas";
        } else {
            const inicio =
                ((paginaActual - 1) * registrosPorPagina) + 1;

            const fin = Math.min(
                paginaActual * registrosPorPagina, total
            );
            texto.textContent = `Mostrando ${inicio}-${fin} de ${total} entregas`;
        }
    }

    if (!botones) {
        return;
    }
    botones.innerHTML = "";
    if (totalPaginas <= 1) {
        return;
    }

    const anterior = document.createElement("button");
    anterior.className = "page-btn";
    anterior.type = "button";
    anterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    anterior.disabled = paginaActual === 1;
    anterior.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarRecetas();
        }
    });
    botones.appendChild(anterior);
    
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "page-btn";
        if (pagina === paginaActual) {
            boton.classList.add("active");
        }
        boton.textContent = pagina;
        boton.addEventListener("click", () => {
            paginaActual = pagina;
            mostrarRecetas();
        });
        botones.appendChild(boton);
    }

    const siguiente = document.createElement("button");
    siguiente.className = "page-btn";
    siguiente.type = "button";
    siguiente.innerHTML = `<i class="ph ph-caret-right"></i>`;
    siguiente.disabled = paginaActual === totalPaginas;

    siguiente.addEventListener("click", () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarRecetas();
        }
    });
    botones.appendChild(siguiente);
}

function configurarBuscador() {
    const buscador = document.getElementById("buscarInterno");
    if (!buscador) {
        return;
    }
    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase().trim();
        recetasFiltradas = recetas.filter(receta => {
            const nombre = (
                receta.internoNombre || ""
            ).toLowerCase();

            const numero = String(
                receta.internoId || ""
            ).toLowerCase();

            return (
                nombre.includes(texto) || numero.includes(texto)
            );
        });
        paginaActual = 1;
        mostrarRecetas();
    });
}

async function abrirEntrega(recetaId) {
    try {
        const respuesta = await fetch(`${API}/Recetas/${recetaId}`);
        if (!respuesta.ok) {
            const mensaje = await obtenerMensajeError(respuesta);
            throw new Error(mensaje);
        }
        
        const receta = await respuesta.json();
        recetaSeleccionada = receta;
        await cargarDatosReceta(recetaId);
        cerrarNotificaciones(false);

        const modal = document.getElementById("modalEntrega");
        if (modal) {
            modal.classList.add("active");
        }
    } catch (error) {
        console.error("Error al abrir receta:", error);
        alert(error.message || "No se pudo cargar la receta.");
    }
}

async function cargarDatosReceta(recetaId) {
    const recetaLista = recetas.find(receta => receta.id === recetaId);
    let datos = recetaLista;
    try {
        const respuesta = await fetch(
            `${API}/Recetas/pendientes/${recetaId}`
        );
        if (respuesta.ok) {
            datos = await respuesta.json();
        }
    } catch (error) {
        console.warn(
            "No se pudieron cargar datos adicionales:", error
        );
    }
    if (!datos) {
        datos = recetaLista;
    }
    mostrarDatosReceta(datos);
}

function mostrarDatosReceta(receta) {
    if (!receta) {
        return;
    }
    const nombre = document.getElementById("modalInternoNombre");
    const numero = document.getElementById("modalInternoNumero");
    const especialista = document.getElementById("modalEspecialista");
    const atencion = document.getElementById("modalAtencion");
    if (nombre) {
        nombre.textContent = receta.internoNombre || "Sin nombre";
    }
    if (numero) {
        numero.textContent = `#${receta.internoId ?? "----"}`;
    }
    if (especialista) {
        especialista.textContent = receta.medicoSolicitante || "No registrado";
    }
    if (atencion) {
        atencion.textContent =
            receta.atencionMedicaID
                ? `AT-${String(
                    receta.atencionMedicaID
                ).padStart(5, "0")}`
                : "----";
    }

    const contenedor = document.getElementById("modalMedicamentos");
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";

    const detalles = receta.detalles || [];
    if (detalles.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-message">
                No hay medicamentos registrados.
            </div>
        `;
        return;
    }

    detalles.forEach(medicamento => {
        const elemento = document.createElement("div");
        elemento.className = "modal-medicine";
        elemento.innerHTML = `
            <strong>
                ${escapeHtml(medicamento.medicamento)}
            </strong>

            <span>
                ${escapeHtml(
                    medicamento.dosis || "Sin dosis"
                )}
            </span>

            <span>
                Frecuencia:
                ${escapeHtml(
                    medicamento.frecuencia || "No indicada"
                )}
            </span>

            <span>
                Duración:
                ${escapeHtml(
                    medicamento.duracion || "No indicada"
                )}
            </span>

            <span class="medicine-quantity">
                Cantidad:
                ${escapeHtml(
                    medicamento.cantidad ??
                    "No indicada"
                )}
            </span>

            ${
                medicamento.indicaciones
                    ? `
                        <span class="medicine-quantity">
                            Indicaciones:
                            ${escapeHtml(
                                medicamento.indicaciones
                            )}
                        </span>
                    `
                    : ""
            }
        `;
        contenedor.appendChild(elemento);
    });
}

function configurarModal() {
    document
        .getElementById("cerrarModalEntrega")
        ?.addEventListener( "click", cerrarEntrega);
    document
        .getElementById("cancelarModalEntrega")
        ?.addEventListener("click", cerrarEntrega);

    document
        .getElementById("btnConfirmarEntrega")
        ?.addEventListener("click", confirmarEntrega);
    document
        .getElementById("modalEntrega")
        ?.addEventListener("click",
            event => {
                if (
                    event.target.id === "modalEntrega"
                ) {
                    cerrarEntrega();
                }
            }
        );
}

function cerrarEntrega() {
    const modal = document.getElementById("modalEntrega");
    if (modal) {
        modal.classList.remove("active");
    }

    recetaSeleccionada = null;
    const costo = document.getElementById("costoTotal");
    const observaciones = document.getElementById("observaciones");
    if (costo) {
        costo.value = "";
    }
    if (observaciones) {
        observaciones.value = "";
    }
}

async function confirmarEntrega() {
    if (!recetaSeleccionada) {
        alert("No se ha seleccionado una receta.");
        return;
    }

    const costo = document.getElementById("costoTotal");
    const observaciones = document.getElementById("observaciones");
    const boton = document.getElementById("btnConfirmarEntrega");
    const costoTotal = parseFloat(costo?.value || "" );
    if (
        isNaN(costoTotal) || costoTotal <= 0
    ) {
        alert("Debe ingresar un costo válido para los medicamentos.");
        costo?.focus();
        return;
    }
    try {
        boton.disabled = true;
        boton.innerHTML = `<i class="ph ph-spinner"></i>Registrando...`;
        const usuarioId = parseInt(localStorage.getItem("usuarioId"));
        const datosEnviar = {
            recetaID: recetaSeleccionada.id,
            entregadoPorUsuarioID: Number.isNaN(usuarioId)
                    ? null
                    : usuarioId,
            costoTotal: costoTotal,
            observaciones: observaciones?.value.trim() || ""
        };

        const respuesta =
            await fetch(
                `${API}/EntregasFarmacia`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body:
                        JSON.stringify(
                            datosEnviar
                        )
                }
            );
        const datos = await obtenerRespuesta(respuesta);
        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "No se pudo registrar la entrega.");
        }
        alert("La entrega fue registrada correctamente.");
        cerrarEntrega();
        await cargarRecetas();
    } catch (error) {
        console.error(
            "Error al registrar entrega:", error
        );
        alert(error.message || "Ocurrió un error al registrar la entrega.");
    } finally {
        boton.disabled = false;
        boton.innerHTML = `<i class="ph ph-check"></i>Confirmar entrega`;
    }
}

function configurarNotificaciones() {
    const boton = document.getElementById("btnNotificaciones");
    if (!boton) {
        return;
    }
    boton.addEventListener("click",
        event => {
            event.stopPropagation();
            const panel = document.getElementById("notificationPanel");
            if (!panel) {
                return;
            }

            const seEstaAbriendo = !panel.classList.contains("active");
            if (seEstaAbriendo) {
                panel.classList.add("active");
            } else {
                marcarNotificacionesComoVistas();
                panel.classList.remove("active");
            }
        }
    );

    document.addEventListener("click",
        event => {
            const wrapper = document.querySelector(".notification-wrapper");
            const panel = document.getElementById("notificationPanel");
            if (
                wrapper && !wrapper.contains(event.target) && panel?.classList.contains("active")
            ) {
                marcarNotificacionesComoVistas();
                cerrarNotificaciones(false);
            }
        }
    );
}

function actualizarNotificaciones(
    recetasPendientes
) {
    const dot = document.getElementById("notificationDot");
    const lista = document.getElementById("notificationList");
    const contador = document.getElementById("notificationCount");
    if (
        !dot || !lista || !contador
    ) {
        return;
    }
    lista.innerHTML = "";
    const nuevasRecetas =
        recetasPendientes.filter(
            receta =>
                !notificacionesVistas.includes(receta.id)
        );
    if (
        nuevasRecetas.length > 0
    ) {
        dot.classList.add("active");
    } else {
        dot.classList.remove("active");
    }

    contador.textContent = nuevasRecetas.length === 1
            ? "1 receta nueva"
            : `${nuevasRecetas.length} recetas nuevas`;
    if (
        nuevasRecetas.length === 0
    ) {
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

    nuevasRecetas.forEach(
        receta => {
            const cantidad = receta.detalles?.length || 0;
            const item = document.createElement("button");
            item.type = "button";
            item.className = "notification-item";

            item.innerHTML = `
                <div class="notification-icon">
                    <i class="ph ph-pill"></i>
                </div>

                <div class="notification-content">
                    <strong>
                        Nueva receta pendiente
                    </strong>

                    <span>
                        ${escapeHtml(
                            receta.internoNombre || "Interno"
                        )}
                    </span>

                    <small>
                        ${cantidad}
                        ${
                            cantidad === 1
                                ? " medicamento"
                                : " medicamentos"
                        }
                    </small>
                </div>
                <i class="ph ph-caret-right notification-arrow"></i>
            `;

            item.addEventListener(
                "click",
                () => {
                    marcarNotificacionComoVista(receta.id);
                    cerrarNotificaciones(false);
                    abrirEntrega(receta.id);
                }
            );
            lista.appendChild(item);
        }
    );
}

function marcarNotificacionComoVista(
    recetaId
) {
    if (
        !notificacionesVistas.includes(recetaId)
    ) {
        notificacionesVistas.push(recetaId);
    }
    localStorage.setItem("notificacionesFarmaciaVistas", JSON.stringify(notificacionesVistas));
    actualizarNotificaciones(recetas);
}

function marcarNotificacionesComoVistas() {
    if (
        !recetas || recetas.length === 0
    ) {
        return;
    }
    recetas.forEach(
        receta => {
            if (
                !notificacionesVistas.includes(receta.id)
            ) {
                notificacionesVistas.push(receta.id);
            }
        }
    );

    localStorage.setItem("notificacionesFarmaciaVistas", JSON.stringify(notificacionesVistas));
    actualizarNotificaciones(recetas);
}

function cerrarNotificaciones(
    marcarVistas = true
) {
    if (marcarVistas) {
        marcarNotificacionesComoVistas();
    }

    const panel = document.getElementById("notificationPanel");
    if (panel) {
        panel.classList.remove(
            "active"
        );
    }
}

async function obtenerRespuesta(
    respuesta
) {
    const texto = await respuesta.text();
    if (!texto) {
        return {};
    }
    try {
        return JSON.parse(texto);
    } catch {
        return {
            mensaje: `El servidor devolvió una respuesta no válida: ${texto}`
        };
    }
}

async function obtenerMensajeError(
    respuesta
) {
    const contenido = await obtenerRespuesta(respuesta);
    return (
        contenido.mensaje || contenido.title || `Error ${respuesta.status}: ${respuesta.statusText}`
    );
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaObj = new Date(fecha);
    if (
        isNaN(fechaObj.getTime())
    ) {
        return "Sin fecha";
    }
    return fechaObj.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function escapeHtml(valor) {
    if (
        valor === null || valor === undefined
    ) {
        return "";
    }
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}