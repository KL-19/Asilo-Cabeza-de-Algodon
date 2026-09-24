const tablaInternos = document.getElementById("internosTableBody");
const totalInternos = document.getElementById("totalInternos");
const internosActivos = document.getElementById("internosActivos");
const mostrandoInternos = document.getElementById("mostrandoInternos");
const totalInternosFooter = document.getElementById("totalInternosFooter");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const filterButton = document.querySelector(".filter-button");


// Variables
let internos = [];
let internosFiltrados = [];
let paginaActual = 1;
const internosPorPagina = 10;

// Cargar internos desde la Api
async function cargarInternos() {
    try {
        console.log("Iniciando carga de internos...");

        const response = await fetch(
            "http://localhost:5054/api/Internos"
        );

        console.log(
            "Respuesta del API:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                "El API respondió con error: "
                + response.status
            );
        }

        const datos = await response.json();
        console.log(
            "Datos recibidos:",
            datos
        );

        internos = datos;
        internosFiltrados = internos;
        
        // Actualizar tarjetas
        if (totalInternos) {
            totalInternos.textContent =internos.length;
        }

        const cantidadActivos =
            internos.filter(function (interno) {
                return interno.activo === true;
            }).length;

        if (internosActivos) {
            internosActivos.textContent = cantidadActivos;
        }

        // Mostrar datos
        paginaActual = 1;
        mostrarPagina();
    }
    catch (error) {
        console.error(
            "ERROR AL CARGAR INTERNOS:",
            error
        );

        if (tablaInternos) {
            tablaInternos.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align: center;">
                        Error al cargar los internos.
                    </td>
                </tr>
            `;
        }
    }

}

// Mostrar pagina
function mostrarPagina() {
    if (!tablaInternos) {
        console.error(
            "No existe #internosTableBody en el HTML."
        );
        return;
    }

    // Limpiar tabla
    tablaInternos.innerHTML = "";

    // Calcular pagina
    const totalPaginas =
        Math.ceil(internosFiltrados.length / internosPorPagina);

    if (
        totalPaginas > 0 &&
        paginaActual > totalPaginas
    ) {
        paginaActual =
            totalPaginas;
    }

    // Obtener internos de la pagina
    const inicio = (paginaActual - 1) * internosPorPagina;
    const fin = inicio + internosPorPagina;
    const internosPagina = internosFiltrados.slice( inicio, fin);

    // Si no hay internos
    if (internosPagina.length === 0) {
        tablaInternos.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align: center;">
                    No hay internos registrados.
                </td>
            </tr>
        `;
    }

    // Creal filas
    internosPagina.forEach(
        function (interno) {
            const fila = document.createElement("tr");
            const edad = calcularEdad( interno.fechaNacimiento);
            const fechaIngreso = formatearFecha(interno.fechaIngreso);
            const estado =
                interno.activo
                    ? "Activo"
                    : "Inactivo";

            const iniciales =obtenerIniciales(interno.nombreCompleto);

            fila.innerHTML = `
                <td>
                    <div class="resident">
                        <div class="resident-avatar">
                            ${iniciales}
                        </div>

                        <div>
                            <strong>
                                ${interno.nombreCompleto}
                            </strong>

                            <span>
                                DPI:
                                ${
                                    interno.dpi || "No registrado"
                                }
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    ${edad} años
                </td>

                <td>
                    <div class="family">
                        <strong>
                            ${
                                interno.familiar
                                    ? interno.familiar.nombreCompleto
                                    : "Sin familiar"
                            }
                        </strong>

                        <span>
                            ${
                                interno.familiar
                                    ? interno.familiar.parentesco || ""
                                    : ""
                            }
                        </span>
                    </div>
                </td>

                <td>
                    ${fechaIngreso}
                </td>

                <td>
                    <span
                        class="status ${
                            interno.activo
                                ? "active"
                                : "inactive"
                        }">
                        <i class="ph ph-circle"></i>
                        ${estado}
                    </span>
                </td>

                <td>
                    <div class="actions">
                        <button
                            class="action-btn view"
                            title="Ver expediente"
                            data-id="${interno.id}">
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            class="action-btn edit"
                            title="Editar interno"
                            data-id="${interno.id}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            class="action-btn delete"
                            title="Dar de baja"
                            data-id="${interno.id}">
                            <i class="ph ph-user-minus"></i>
                        </button>
                    </div>
                </td>
            `;

            tablaInternos.appendChild(
                fila
            );

        }
    );

    // Actualizar footer
    if (mostrandoInternos) {
        mostrandoInternos.textContent = internosPagina.length;
    }

    if (totalInternosFooter) {
        totalInternosFooter.textContent = internosFiltrados.length;
    }

    // Crear paginacion
    crearPaginacion();
}

// Crear paginacion
function crearPaginacion() {
    if (!pagination) {
        console.error(
            "No existe #pagination en el HTML."
        );
        return;
    }

    pagination.innerHTML = "";
    const totalPaginas = Math.ceil( internosFiltrados.length / internosPorPagina);

    // Si no hay páginas, no crear botones
    if (totalPaginas === 0) {
        return;
    }

    // Boton anterior
    const botonAnterior = document.createElement("button");
    botonAnterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    botonAnterior.disabled = paginaActual === 1;

    botonAnterior.addEventListener(
        "click",
        function () {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarPagina();
            }
        }
    );

    pagination.appendChild(
        botonAnterior
    );

    // NÚMEROS DE PÁGINA
    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        const boton = document.createElement("button");
        boton.textContent = pagina;
        if (
            pagina ===
            paginaActual
        ) {
            boton.classList.add(
                "current"
            );
        }

        boton.addEventListener(
            "click",
            function () {
                paginaActual =pagina;
                mostrarPagina();
            }
        );

        pagination.appendChild(
            boton
        );
    }

    // BOTON SIGUIENTE
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

    pagination.appendChild(
        botonSiguiente
    );
}

// CALCULAR EDAD
function calcularEdad(
    fechaNacimiento
) {
    const nacimiento = new Date( fechaNacimiento );
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoy.getDate() <
            nacimiento.getDate()
        )
    ) {
        edad--;
    }
    return edad;
}

// FORMATEAR FECHA
function formatearFecha(
    fecha
) {
    const fechaConvertida = new Date(fecha);
    return fechaConvertida.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

// OBTENER INICIALES
function obtenerIniciales(
    nombreCompleto
) {
    const palabras = nombreCompleto
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

// FILTRAR INTERNOS
function aplicarFiltros() {
    const texto = searchInput.value
            .trim()
            .toLowerCase();
    const estadoSeleccionado = statusFilter.value;
    internosFiltrados = internos.filter(function (interno) {

            // BUSCAR POR NOMBRE, DPI O FAMILIAR
            const nombre =
                interno.nombreCompleto
                    ? interno.nombreCompleto.toLowerCase()
                    : "";

            const dpi =
                interno.dpi
                    ? interno.dpi.toLowerCase()
                    : "";

            const familiar =
                interno.familiar &&
                interno.familiar.nombreCompleto
                    ? interno.familiar.nombreCompleto.toLowerCase()
                    : "";

            const coincideBusqueda = nombre.includes(texto) || dpi.includes(texto) || familiar.includes(texto);

            // FILTRAR POR ESTADO
            let coincideEstado = true;
            if (
                estadoSeleccionado === "activo"
            ) {
                coincideEstado = interno.activo === true;
            }

            if (
                estadoSeleccionado === "inactivo"
            ) {
                coincideEstado = interno.activo === false;
            }

            // RESULTADO FINAL
            return ( coincideBusqueda && coincideEstado );
        });
    paginaActual = 1;

    // MOSTRAR RESULTADOS
    mostrarPagina();
}

// BOTÓN FILTRAR
filterButton.addEventListener(
    "click",
    function () {
        aplicarFiltros();
    }
);

// BUSCAR CON ENTER
searchInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            aplicarFiltros();
        }
    }
);

// iniciar
cargarInternos();

// MODAL EXPEDIENTE
const expedienteModal = document.getElementById("expedienteModal");
const cerrarModal = document.getElementById("cerrarModal");
const cerrarModalFooter = document.getElementById("cerrarModalFooter");

// ABRIR EXPEDIENTE
function abrirExpediente(id) {
    const interno = internos.find(function (item) {
            return item.id === id;
        });

    if (!interno) {
        console.error(
            "No se encontró el interno con ID:",
            id
        );
        return;
    }

    // DATOS PERSONALES
    document.getElementById("modalNombre" ).textContent = interno.nombreCompleto;
    document.getElementById("modalNombreCompleto").textContent = interno.nombreCompleto;
    document.getElementById("modalEdad").textContent = calcularEdad( interno.fechaNacimiento) + " años";
    document.getElementById("modalFechaNacimiento").textContent = formatearFecha(interno.fechaNacimiento);
    document.getElementById("modalDPI").textContent = interno.dpi || "No registrado";
    document.getElementById("modalFechaIngreso").textContent = formatearFecha(interno.fechaIngreso);

    // ESTADO
    document.getElementById("modalEstado").textContent =interno.activo
            ? "Activo"
            : "Inactivo";

    // FAMILIAR RESPONSABLE
    if (interno.familiar) {
        document.getElementById("modalFamiliar").textContent = interno.familiar.nombreCompleto || "No registrado";
        document.getElementById("modalParentesco").textContent = interno.familiar.parentesco || "No registrado";
        document.getElementById("modalTelefono").textContent = interno.familiar.telefono || "No registrado";
        document.getElementById("modalCorreo").textContent = interno.familiar.correo || "No registrado";
    }
    else {
        document.getElementById("modalFamiliar").textContent = "Sin familiar";
        document.getElementById("modalParentesco").textContent = "No registrado";
        document.getElementById("modalTelefono").textContent = "No registrado";
        document.getElementById("modalCorreo").textContent = "No registrado";
    }

    // PSICOPATOLOGÍAS
    const modalPsicopatologia = document.getElementById("modalPsicopatologia");
    modalPsicopatologia.innerHTML = "";
    if (
        interno.psicopatologias && interno.psicopatologias.length > 0
    ) {
        interno.psicopatologias.forEach(
            function (psicopatologia) {
                const elemento = document.createElement("div");
                elemento.classList.add("modal-info-item");
                elemento.textContent =psicopatologia.condicionPadecimiento;
                modalPsicopatologia.appendChild(elemento);
            }
        );
    }
    else {
        modalPsicopatologia.innerHTML = "No registrado.";
    }

    // MEDICAMENTOS
    const modalMedicamentos = document.getElementById("modalMedicamentos");
    modalMedicamentos.innerHTML = "";
    if (
        interno.medicamentos && interno.medicamentos.length > 0
    ) {
        interno.medicamentos.forEach(
            function (medicamento) {
                const elemento = document.createElement("div");
                elemento.classList.add("modal-medicamento");

                elemento.innerHTML = `
                    <strong>
                        ${medicamento.medicamento}
                    </strong>

                    <span>
                        Cantidad:
                        ${medicamento.cantidad}
                    </span>

                    <span>
                        Frecuencia:
                        ${medicamento.frecuencia}
                    </span>

                    <span>
                        Tiempo de aplicación:
                        ${medicamento.tiempoAplicacion}
                    </span>
                `;
                modalMedicamentos.appendChild(
                    elemento
                );

            }
        );

    }
    else {
        modalMedicamentos.innerHTML = `
            <div class="modal-info-box">
                No hay medicamentos registrados.
            </div>
        `;
    }

    // MOSTRAR MODAL
    expedienteModal.classList.add("show");
}

// CERRAR MODAL
function cerrarExpediente() {
    expedienteModal.classList.remove("show");

}

// BOTONES CERRAR
cerrarModal.addEventListener("click",cerrarExpediente);
cerrarModalFooter.addEventListener("click",cerrarExpediente);

// CERRAR AL HACER CLICK FUERA DEL MODAL
expedienteModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target === expedienteModal
        ) {
            cerrarExpediente();
        }
    }
);

// BOTÓN VER EXPEDIENTE
tablaInternos.addEventListener(
    "click",
    function (event) {
        const boton = event.target.closest(".action-btn.view");

        if (!boton) {
            return;
        }

        const id = parseInt(boton.dataset.id);
        abrirExpediente(id);
    }
);

// DAR DE BAJA A UN INTERNO
async function darDeBaja(id) {
    const interno = internos.find(function (item) {
            return item.id === id;
        });

    if (!interno) {
        console.error(
            "No se encontró el interno con ID:", id
        );
        return;
    }

    // CONFIRMAR
    const confirmar = confirm(
            "¿Está seguro de que desea dar de baja a "
            + interno.nombreCompleto
            + "?"
        );
    if (!confirmar) {
        return;
    }

    // ENVIAR SOLICITUD AL API
    try {
        const response = await fetch("http://localhost:5054/api/Internos/" + id + "/baja",
                {
                    method: "PUT"
                }
            );
        const resultado = await response.json();
        if (response.ok) {
            alert(
                resultado.mensaje
            );

            // Volver a cargar los internos
            await cargarInternos();
        }
        else {
            alert(
                resultado.mensaje || "No se pudo dar de baja al interno."
            );
        }
    }
    catch (error) {
        console.error(
            "Error al dar de baja:", error
        );

        alert(
            "No se pudo conectar con el API."
        );
    }

}

// BOTÓN DAR DE BAJA
tablaInternos.addEventListener(
    "click",
    function (event) {
        const boton = event.target.closest(".action-btn.delete");
        if (!boton) {
            return;
        }
        const id = parseInt(boton.dataset.id);
        darDeBaja(id);
    }
);

// BOTÓN EDITAR INTERNO
tablaInternos.addEventListener(
    "click",
    function (event) {
        const boton = event.target.closest(".action-btn.edit");
        if (!boton) {
            return;
        }
        const id =boton.dataset.id;
        window.location.href = "editarInterno.html?id=" + id;
    }
);