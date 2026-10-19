const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let examenes = [];
let examenesFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 8;

document.addEventListener("DOMContentLoaded", () => {
    cargarExamenes();
    const buscador = document.getElementById("buscarInterno");
    if (buscador) {
        buscador.addEventListener("input", aplicarFiltro);
    }
    document
        .getElementById("btnPaginaAnterior")
        ?.addEventListener("click", paginaAnterior);
    document
        .getElementById("btnPaginaSiguiente")
        ?.addEventListener("click", paginaSiguiente);
});

async function cargarExamenes() {
    const tbody = document.getElementById("examenesTableBody");
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-message">
                    Cargando exámenes...
                </td>
            </tr>
        `;

        const respuesta = await fetch(`${API}/ResultadosLaboratorio/en-proceso`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los exámenes.");
        }
        examenes = await respuesta.json();
        examenesFiltrados = [...examenes];
        paginaActual = 1;
        mostrarExamenes();
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No fue posible cargar los exámenes.
                </td>
            </tr>
        `;
        actualizarPaginacion(0);
    }
}

function mostrarExamenes() {
    const tbody = document.getElementById("examenesTableBody");
    tbody.innerHTML = "";
    if (examenesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No hay exámenes en proceso.
                </td>
            </tr>
        `;
        actualizarPaginacion(0);
        return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const examenesPagina = examenesFiltrados.slice(inicio, fin);
    examenesPagina.forEach(examen => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>
                <div class="patient">
                    <div class="patient-avatar">
                        <i class="ph ph-user"></i>
                    </div>

                    <div>
                        <strong>
                            Interno #${formatearNumeroInterno(examen.internoId)}
                        </strong>

                        <span>
                            ${escapeHtml(examen.internoNombre)}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                ${escapeHtml(examen.tipoExamen)}
            </td>

            <td>
                ${escapeHtml(
                    examen.medicoSolicitante || "No registrado"
                )}
            </td>

            <td>
                ${formatearFecha(examen.fechaSolicitud)}
            </td>

            <td>
                <span class="status processing">
                    ${escapeHtml(examen.estado)}
                </span>
            </td>

            <td>
                <a
                    href="registrarResultado.html?examenId=${examen.id}"
                    class="btn-detail"
                >
                    <i class="ph ph-flask"></i>
                    Registrar resultado
                </a>
            </td>
        `;
        tbody.appendChild(fila);
    });
    actualizarPaginacion(examenesFiltrados.length);
}

function aplicarFiltro(event) {
    const texto = event.target.value.trim().toLowerCase();
    examenesFiltrados =
        examenes.filter(examen => {
            const nombre = (examen.internoNombre || "").toLowerCase();
            const numero = String(examen.internoId || "").toLowerCase();
            const examenNombre = (examen.tipoExamen || "").toLowerCase();
            return (
                nombre.includes(texto) ||
                numero.includes(texto) ||
                examenNombre.includes(texto)
            );
        });
    paginaActual = 1;
    mostrarExamenes();
}

function paginaAnterior() {
    if (paginaActual <= 1) {
        return;
    }
    paginaActual--;
    mostrarExamenes();
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(examenesFiltrados.length / registrosPorPagina);
    if (paginaActual >= totalPaginas) {
        return;
    }
    paginaActual++;
    mostrarExamenes();
}

function actualizarPaginacion(total) {
    const totalPaginas =
        Math.max(
            1,
            Math.ceil(total / registrosPorPagina)
        );
    const pagina = document.getElementById("paginaActual");
    const anterior = document.getElementById("btnPaginaAnterior");
    const siguiente = document.getElementById("btnPaginaSiguiente");
    const info = document.getElementById("paginationInfo");
    if (pagina) {
        pagina.textContent = paginaActual;
    }
    if (anterior) {
        anterior.disabled = paginaActual <= 1;
    }
    if (siguiente) {
        siguiente.disabled = paginaActual >= totalPaginas;
    }

    if (info) {
        if (total === 0) {
            info.textContent = "Mostrando 0 exámenes";
        } else {
            const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
            const fin =
                Math.min(paginaActual * registrosPorPagina,total);
            info.textContent =`Mostrando ${inicio}-${fin} de ${total} exámenes`;
        }
    }
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaObj =new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
        return "Sin fecha";
    }
    return fechaObj.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function formatearNumeroInterno(id) {
    if (id === null || id === undefined) {
        return "----";
    }
    return String(id).padStart(4, "0");
}


function escapeHtml(text) {
    if (text === null || text === undefined) {
        return "";
    }
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}