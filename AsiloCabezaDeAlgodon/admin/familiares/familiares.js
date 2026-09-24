const tablaFamiliares = document.getElementById("familyTable");
const mostrandoFamiliares = document.getElementById("mostrandoFamiliares");
const totalFamiliaresFooter = document.getElementById("totalFamiliaresFooter");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

// VARIABLES
let familiares = [];
let familiaresFiltrados = [];
let paginaActual = 1;
const familiaresPorPagina = 10;

// CARGAR FAMILIARES
async function cargarFamiliares() {
    try {
        const response = await fetch("http://localhost:5054/api/Familiares");
        if (!response.ok) {
            throw new Error("Error al obtener familiares.");
        }
        const datos =await response.json();
        familiares = datos;
        familiaresFiltrados = familiares;
        paginaActual = 1;
        mostrarPagina();
    } catch (error) {
        console.error(
            "Error al cargar familiares:", error
        );

        tablaFamiliares.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    Error al cargar los familiares.
                </td>
            </tr>
        `;
    }
}


// MOSTRAR PAGINA
function mostrarPagina() {
    tablaFamiliares.innerHTML = "";
    const totalPaginas = Math.ceil(familiaresFiltrados.length / familiaresPorPagina);

    if (
        totalPaginas > 0 && paginaActual > totalPaginas
    ) {
        paginaActual = totalPaginas;
    }
    const inicio = (paginaActual - 1) * familiaresPorPagina;
    const fin = inicio + familiaresPorPagina;
    const familiaresPagina = familiaresFiltrados.slice(inicio,fin);

    if (
        familiaresPagina.length === 0
    ) {
        tablaFamiliares.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    No hay familiares registrados.
                </td>
            </tr>
        `;
    }

    familiaresPagina.forEach(
        function (familiar) {
            const fila = document.createElement("tr");
         
            // INTERNOS ASOCIADOS
            let internosHTML = "Sin interno asociado";
            if (
                familiar.internos && familiar.internos.length > 0
            ) {
                internosHTML =
                    familiar.internos
                        .map(
                            function (interno) {
                                const clase =
                                    interno.activo
                                        ? "active"
                                        : "inactive";
                                return `
                                    <span
                                        class="resident-badge ${clase}"> ${interno.nombreCompleto}
                                    </span>
                                `;
                            }
                        )
                        .join("");
            }

            // INICIALES
            const iniciales = obtenerIniciales(familiar.nombreCompleto);

            // ESTADO
            const estado =
                familiar.activo
                    ? "Activo"
                    : "Inactivo";

            const claseEstado =
                familiar.activo
                    ? "active"
                    : "inactive";

            fila.innerHTML = `
                <td>
                    <div class="person">
                        <div class="person-avatar blue">
                            ${iniciales}
                        </div>

                        <div>
                            <strong>
                                ${familiar.nombreCompleto}
                            </strong>

                            <span>
                                Familiar responsable
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    ${familiar.parentesco || "No registrado"}
                </td>

                <td>
                    ${familiar.telefono || "No registrado"}
                </td>

                <td>
                    ${familiar.correo || "No registrado"}
                </td>

                <td>
                    <div class="resident-list">
                        ${internosHTML}
                    </div>
                </td>

                <td>
                    <div class="actions">
                        <button
                            class="action-btn view"
                            title="Ver información"
                            data-id="${familiar.id}">
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            class="action-btn edit"
                            title="Editar familiar"
                            data-id="${familiar.id}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                    </div>
                </td>
            `;
            tablaFamiliares.appendChild(fila);
        }
    );

    mostrandoFamiliares.textContent = familiaresPagina.length;
    totalFamiliaresFooter.textContent =familiaresFiltrados.length;
    crearPaginacion();
}

// INICIALES

function obtenerIniciales(nombre) {
    if (!nombre) {
        return "F";
    }
    const palabras =
        nombre
            .trim()
            .split(" ");

    if (
        palabras.length === 1
    ) {
        return palabras[0]
            .substring(0, 2)
            .toUpperCase();
    }
    return (
        palabras[0].charAt(0) +
        palabras[1].charAt(0)
    ).toUpperCase();
}

// PAGINACION
function crearPaginacion() {
    pagination.innerHTML = "";
    const totalPaginas =Math.ceil(familiaresFiltrados.length / familiaresPorPagina);

    if (totalPaginas <= 1) {
        return;
    }
    const botonAnterior = document.createElement("button");
    botonAnterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    botonAnterior.disabled = paginaActual === 1;

    botonAnterior.addEventListener(
        "click",
        function () {
            if (
                paginaActual > 1
            ) {
                paginaActual--;
                mostrarPagina();
            }
        }
    );

    pagination.appendChild(botonAnterior);

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        const boton = document.createElement("button");
        boton.textContent = pagina;
        if (
            pagina === paginaActual
        ) {
            boton.classList.add("current");
        }

        boton.addEventListener(
            "click",
            function () {
                paginaActual =pagina;
                mostrarPagina();
            }
        );

        pagination.appendChild(boton);
    }
    const botonSiguiente = document.createElement("button");
    botonSiguiente.innerHTML = `<i class="ph ph-caret-right"></i>`;
    botonSiguiente.disabled = paginaActual === totalPaginas;

    botonSiguiente.addEventListener(
        "click",
        function () {
            if (
                paginaActual < totalPaginas
            ) {
                paginaActual++;
                mostrarPagina();
            }
        }
    );

    pagination.appendChild(botonSiguiente);
}

// BUSCAR
function aplicarBusqueda() {
    const texto =
        searchInput.value
            .trim()
            .toLowerCase();

    familiaresFiltrados =
        familiares.filter(
            function (familiar) {
                const nombre =
                    familiar.nombreCompleto
                        ? familiar.nombreCompleto .toLowerCase() : "";

                const parentesco =
                    familiar.parentesco
                        ? familiar.parentesco
                            .toLowerCase()
                        : "";

                const telefono =
                    familiar.telefono
                        ? familiar.telefono
                            .toLowerCase()
                        : "";

                const correo =
                    familiar.correo
                        ? familiar.correo
                            .toLowerCase()
                        : "";

                let internos = "";
                if (
                    familiar.internos
                ) {
                    internos =
                        familiar.internos
                            .map(
                                function (interno) {
                                    return interno
                                        .nombreCompleto
                                        .toLowerCase();
                                }
                            )
                            .join(" ");
                }

                return (
                    nombre.includes(texto) ||
                    parentesco.includes(texto) ||
                    telefono.includes(texto) ||
                    correo.includes(texto) ||
                    internos.includes(texto)
                );
            }
        );

    paginaActual = 1;
    mostrarPagina();
}

searchInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Enter"
        ) {
            aplicarBusqueda();
        }
    }
);

// MODAL
const familiarModal = document.getElementById("familiarModal");
const cerrarModal = document.getElementById("cerrarModal");
const cerrarModalFooter = document.getElementById("cerrarModalFooter");

// ABRIR MODAL
function abrirModalFamiliar(id) {
    const familiar =
        familiares.find(
            function (item) {
                return item.id === id;
            }
        );
    if (!familiar) {
        return;
    }

    document.getElementById("modalNombreCompleto").textContent = familiar.nombreCompleto;
    document.getElementById("modalParentesco").textContent = familiar.parentesco || "No registrado";
    document.getElementById("modalTelefono").textContent = familiar.telefono ||"No registrado";
    document.getElementById("modalCorreo").textContent = familiar.correo || "No registrado";
    document.getElementById("modalDireccion").textContent = familiar.direccion || "No registrada";
    document.getElementById(
        "modalEstado"
    ).textContent =
        familiar.activo
            ? "Activo"
            : "Inactivo";

    const listaInternos =document.getElementById("modalInternos");
    listaInternos.innerHTML = "";

    if (
        familiar.internos && familiar.internos.length > 0
    ) {
        familiar.internos.forEach(
            function (interno) {
                const elemento = document.createElement("div");
                elemento.className = "modal-resident";
                elemento.innerHTML = `
                    <span>
                        ${interno.nombreCompleto}
                    </span>

                    <small>
                        ${interno.activo
                            ? "Activo"
                            : "Inactivo"}
                    </small>
                `;
                listaInternos.appendChild(elemento);
            }
        );
    } else {
        listaInternos.innerHTML = "<span>No tiene internos asociados.</span>";
    }
    familiarModal.classList.add("show");
}

// CERRAR MODAL
function cerrarFamiliarModal() {
    familiarModal.classList.remove("show");
}

cerrarModal.addEventListener(
    "click",
    cerrarFamiliarModal
);

cerrarModalFooter.addEventListener(
    "click",
    cerrarFamiliarModal
);

familiarModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target === familiarModal
        ) {
            cerrarFamiliarModal();
        }
    }
);

// ACCIONES
tablaFamiliares.addEventListener(
    "click",
    function (event) {
        // VER
        const botonVer = event.target.closest(".view");
        if (botonVer) {
            const id =parseInt(botonVer.dataset.id);
            abrirModalFamiliar(id);
            return;
        }

        // EDITAR
        const botonEditar = event.target.closest(".edit");
        if (botonEditar) {
            const id = botonEditar.dataset.id;
            window.location.href = "editarFamiliar.html?id=" + id;
            return;
        }
    }
);

// INICIAR
cargarFamiliares();