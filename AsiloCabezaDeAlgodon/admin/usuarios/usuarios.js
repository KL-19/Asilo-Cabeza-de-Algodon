const tablaUsuarios = document.getElementById("userTable");
const totalUsuarios = document.getElementById("totalUsuarios");
const usuariosActivos = document.getElementById("usuariosActivos");
const mostrandoUsuarios = document.getElementById("mostrandoUsuarios");
const totalUsuariosFooter =document.getElementById("totalUsuariosFooter");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const filterButton = document.querySelector(".filter-btn");

// VARIABLES
let usuarios = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 10;

// CARGAR USUARIOS
async function cargarUsuarios() {
    try {
        const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Usuarios");
        if (!response.ok) {
            throw new Error(
                "Error al obtener usuarios."
            );
        }
        const datos = await response.json();
        usuarios = datos;
        usuariosFiltrados = usuarios;

        // ESTADÍSTICAS
        totalUsuarios.textContent = usuarios.length;
        const cantidadActivos = usuarios.filter(
                function (usuario) {
                    return usuario.activo === true;
                }
            ).length;

        usuariosActivos.textContent = cantidadActivos;
        paginaActual = 1;
        mostrarPagina();
    }catch (error) {
        console.error(
            "Error al cargar usuarios:", error
        );

        tablaUsuarios.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    Error al cargar los usuarios.
                </td>
            </tr>
        `;
    }
}

// MOSTRAR PÁGINA
function mostrarPagina() {
    tablaUsuarios.innerHTML = "";
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    if (
        totalPaginas > 0 && paginaActual > totalPaginas
    ) {
        paginaActual = totalPaginas;
    }
    const inicio = (paginaActual - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(
            inicio,
            fin);
    if (
        usuariosPagina.length === 0
    ) {
        tablaUsuarios.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;
    }

    usuariosPagina.forEach(
        function (usuario) {
            const fila = document.createElement("tr");
            const iniciales = obtenerIniciales(usuario.nombreCompleto);
            const estado = usuario.activo
                    ? "Activo"
                    : "Inactivo";
            const claseEstado = usuario.activo
                    ? "active"
                    : "inactive";
            const claseRol = obtenerClaseRol(usuario.rol);
            const usuarioInactivo = usuario.activo === false;
            
            fila.innerHTML = `
                <td>
                    <div class="user-info">
                        <div
                            class="user-avatar ${claseRol}">
                            ${iniciales}
                        </div>

                        <div>
                            <strong>
                                ${usuario.nombreUsuario}
                            </strong>

                            <span>
                                ${usuario.rol || "Sin rol"}
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    ${usuario.nombreCompleto}
                </td>

                <td>
                    ${usuario.correo}
                </td>

                <td>
                    <span
                        class="role-badge ${claseRol}">
                        ${usuario.rol || "Sin rol"}
                    </span>
                </td>

                <td>
                    <span
                        class="status ${claseEstado}">
                        ${estado}
                    </span>
                </td>

                <td>
                    <div class="actions">
                        <button
                            class="action-btn view"
                            title="Ver usuario"
                            data-id="${usuario.id}">
                            <i class="ph ph-eye"></i>
                        </button>

                        <button
                            class="action-btn edit"
                            title="${usuarioInactivo ? 'Usuario inactivo' : 'Editar usuario'}"
                            data-id="${usuario.id}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>

                        <button
                            class="action-btn delete"
                            title="${usuarioInactivo ? 'Usuario inactivo' : 'Dar de baja'}"
                            data-id="${usuario.id}">
                            <i class="ph ph-user-minus"></i>
                        </button>
                    </div>
                </td>
            `;

            tablaUsuarios.appendChild(fila);
        }
    );

    mostrandoUsuarios.textContent = usuariosPagina.length;
    totalUsuariosFooter.textContent = usuariosFiltrados.length;
    crearPaginacion();
}

// PAGINACIÓN
function crearPaginacion() {
    pagination.innerHTML = "";

    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    if (totalPaginas <= 1) {
        return;
    }
    const botonAnterior = document.createElement("button");
    botonAnterior.innerHTML =`<i class="ph ph-caret-left"></i>`;
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
            boton.classList.add(
                "current"
            );
        }

        boton.addEventListener(
            "click",
            function () {
                paginaActual = pagina;
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

// INICIALES
function obtenerIniciales(
    nombre
) {
    if (!nombre) {
        return "U";
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
        palabras[0].charAt(0) + palabras[1].charAt(0)
    ).toUpperCase();
}

// CLASE DEL ROL
function obtenerClaseRol(rol) {
    if (!rol) {
        return "blue";
    }

    const texto = rol.toLowerCase();
    if (
        texto.includes("administrador")
    ) {
        return "admin";
    }if (
        texto.includes("médico general") || texto.includes("medico general") ||  texto.includes("medicogeneral")
    ) {
        return "doctor";
    }if (
        texto.includes("especialista")
    ) {
        return "specialist";
    }if (
        texto.includes("enfermero")
    ) {
        return "nurse";
    }if (
        texto.includes("farmacia")
    ) {
        return "pharmacy";
    }if (
        texto.includes("laboratorio")
    ) {
        return "laboratory";
    }if (
        texto.includes("fundación") || texto.includes("fundacion")
    ) {
        return "foundation";
    }

    return "blue";
}

// FILTROS
function aplicarFiltros() {
    const texto = searchInput.value.trim().toLowerCase();
    const estadoSeleccionado = statusFilter.value;

    usuariosFiltrados =
        usuarios.filter(
            function (usuario) {
                const nombre =
                    usuario.nombreCompleto
                        ? usuario.nombreCompleto
                            .toLowerCase()
                        : "";

                const usuarioNombre =
                    usuario.nombreUsuario
                        ? usuario.nombreUsuario
                            .toLowerCase()
                        : "";

                const correo =
                    usuario.correo
                        ? usuario.correo
                            .toLowerCase()
                        : "";

                const rol =
                    usuario.rol
                        ? usuario.rol
                            .toLowerCase()
                        : "";

                const coincideBusqueda =
                    nombre.includes(texto) ||
                    usuarioNombre.includes(texto) ||
                    correo.includes(texto) ||
                    rol.includes(texto);

                let coincideEstado = true;

                if (
                    estadoSeleccionado === "activo"
                ) {
                    coincideEstado = usuario.activo === true;
                }if (
                    estadoSeleccionado === "inactivo"
                ) {
                    coincideEstado = usuario.activo === false;
                }

                return (
                    coincideBusqueda && coincideEstado
                );
            }
        );
    paginaActual = 1;
    mostrarPagina();
}

// BOTON FILTRAR
filterButton.addEventListener(
    "click", aplicarFiltros
);

// BUSCAR CON ENTER
searchInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Enter"
        ) {
            aplicarFiltros();
        }
    }
);

// MODAL
const usuarioModal = document.getElementById("usuarioModal");
const cerrarModal = document.getElementById("cerrarModal");
const cerrarModalFooter = document.getElementById("cerrarModalFooter");

// ABRIR MODAL
function abrirModalUsuario(id) {
    const usuario =
        usuarios.find(
            function (item) {
                return item.id === id;
            }
        );
    if (!usuario) {
        return;
    }
    document.getElementById("modalNombreUsuario").textContent = usuario.nombreUsuario;
    document.getElementById("modalNombreCompleto").textContent = usuario.nombreCompleto;
    document.getElementById("modalUsuario").textContent = usuario.nombreUsuario;
    document.getElementById("modalCorreo").textContent = usuario.correo;
    document.getElementById("modalRol").textContent = usuario.rol || "Sin rol";
    document.getElementById("modalEstado").textContent =
        usuario.activo
            ? "Activo"
            : "Inactivo";

    if (usuario.perfil) {
        document.getElementById("modalColegiado").textContent = usuario.perfil.numeroColegiado || "No registrado";
        document.getElementById("modalTelefono").textContent = usuario.perfil.telefono || "No registrado";
        document.getElementById("modalEspecialidad").textContent = usuario.perfil.especialidad || "No registrada";
    }else {

        document.getElementById("modalColegiado").textContent ="No registrado";
        document.getElementById("modalTelefono").textContent = "No registrado";
        document.getElementById("modalEspecialidad").textContent = "No registrada";
    }

    usuarioModal.classList.add("show");
}

// CERRAR MODAL
function cerrarUsuarioModal() {
    usuarioModal.classList.remove("show");
}

cerrarModal.addEventListener(
    "click", cerrarUsuarioModal
);

cerrarModalFooter.addEventListener(
    "click", cerrarUsuarioModal
);

usuarioModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target === usuarioModal
        ) {
            cerrarUsuarioModal();
        }
    }
);

// ACCIONES DE LA TABLA
tablaUsuarios.addEventListener(
    "click",
    function (event) {
        // VER
        const botonVer = event.target.closest(".view");

        if (botonVer) {
            const id =parseInt(botonVer.dataset.id);
            abrirModalUsuario(id);
            return;
        }

        // EDITAR
        const botonEditar = event.target.closest(".edit");
        if (botonEditar) {
            if (botonEditar.disabled) {
                return;
            }

            const id = parseInt(botonEditar.dataset.id);
            const usuario = usuarios.find(
                function (item) {
                    return item.id === id;
                }
            );

            if (!usuario || usuario.activo === false) {
                alert("No se puede editar un usuario inactivo.");
                return;
            }

            window.location.href = "editarUsuario.html?id=" + id;
            return;
        }

        // DAR DE BAJA
        const botonEliminar = event.target.closest(".delete");
        if (botonEliminar) {
            const id = parseInt(botonEliminar.dataset.id);
            darDeBajaUsuario(id);
        }
    }
);

// DAR DE BAJA
async function darDeBajaUsuario(id) {
    const usuario =
        usuarios.find(
            function (item) {
                return item.id === id;
            }
        );
    if (!usuario) {
        return;
    }

    if (usuario.activo === false) {
        alert("Este usuario ya está inactivo.");
        return;
    }
    const confirmar =
        confirm(
            "¿Está seguro de que desea dar de baja al usuario "
            + usuario.nombreUsuario
            + "?"
        );

    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Usuarios/" + id + "/baja",
                {
                    method: "PUT"
                }
            );
        const resultado = await response.json();
        if (response.ok) {
            alert(resultado.mensaje);
            await cargarUsuarios();
        }else {
            alert(resultado.mensaje ||"No se pudo dar de baja al usuario.");
        }
    }catch (error) {
        console.error(
            "Error al dar de baja:",error
        );

        alert("No se pudo conectar con el API.");
    }
}

// INICIAR
cargarUsuarios();