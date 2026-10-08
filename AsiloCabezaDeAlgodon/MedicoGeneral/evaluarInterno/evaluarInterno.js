const API_BASE = "http://localhost:5054";
let internoSeleccionado = null;
let internosDisponibles = [];
let guardandoEvaluacion = false;

document.addEventListener("DOMContentLoaded", () => {
    cargarInternos();
    cargarEspecialidades();
    cargarEnfermeros();
    cargarUsuario();
    const btnHistorial = document.getElementById("btnHistorial");
    const btnGuardar = document.getElementById("btnGuardar");
    const campoInterno = document.getElementById("interno");
    const requiereEspecialista = document.getElementById("requiereEspecialista");

    if (btnHistorial) {
        btnHistorial.addEventListener(
            "click",
            mostrarHistorial
        );
    }
    if (btnGuardar) {
        btnGuardar.addEventListener(
            "click",
            function (event) {
                event.preventDefault(); 
                guardarEvaluacion(); 
            }
        );
    }
    if (requiereEspecialista) {
        requiereEspecialista.addEventListener(
            "change",
            mostrarCamposEspecialista
        );
    }
    if (campoInterno) {
        campoInterno.addEventListener(
            "input",
            mostrarResultadosBusqueda
        );
        campoInterno.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    buscarInterno();
                }
            }
        );
    }
    mostrarCamposEspecialista();
});

/* USUARIO LOGUEADO*/
function cargarUsuario() {
    const nombreCompleto = localStorage.getItem("nombreCompleto");
    const elemento = document.getElementById("nombreUsuario");
    if (!elemento) {
        return;
    }
    elemento.textContent = nombreCompleto || "Médico General";
}

// CARGAR INTERNOS
async function cargarInternos() {
    try {
        const respuesta = await fetch( `${API_BASE}/api/Internos`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los internos.");
        }
        const internos = await respuesta.json();
        internosDisponibles = internos.filter(interno => interno.activo === true );
        console.log("Internos cargados:",internosDisponibles);
    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudieron cargar los internos.",
            "error"
        );

    }

}

// MOSTRAR RESULTADOS MIENTRAS SE ESCRIBE
function mostrarResultadosBusqueda() {
    const campo = document.getElementById("interno");
    const resultados = document.getElementById("resultadosInternos");

    if (!campo || !resultados) return;
    const texto = campo.value.trim().toLowerCase();
    resultados.innerHTML = "";

    if (!texto) {
        resultados.style.display = "none";
        return;
    }

    const coincidencias =
        internosDisponibles.filter(interno => {
            const nombreCompleto = (interno.nombreCompleto || `${interno.nombre || ""} ${interno.apellido || ""}`).toLowerCase();
            const nombre = (interno.nombre || "") .toLowerCase();
            const apellido = (interno.apellido || "").toLowerCase();
            const dpi = (interno.dpi || "").toString().toLowerCase();
            const id = interno.id.toString().toLowerCase();
            return (
                nombreCompleto.includes(texto) ||
                nombre.includes(texto) ||
                apellido.includes(texto) ||
                dpi.includes(texto) ||
                id.includes(texto)
            );
        });

    if (coincidencias.length === 0) {
        resultados.innerHTML = `
            <div class="resultado-vacio">
                No se encontraron internos.
            </div>
        `;
        resultados.style.display = "block";
        return;
    }

    coincidencias.forEach(interno => {
        const elemento = document.createElement("button");
        elemento.type = "button";
        elemento.className = "resultado-interno";
        const nombreCompleto = interno.nombreCompleto || `${interno.nombre || ""} ${interno.apellido || ""}`;

        elemento.innerHTML = `
            <strong>
                ${nombreCompleto}
            </strong>

            <span>
                Interno #${interno.id}
                ${interno.dpi ? " · DPI " + interno.dpi : ""}
            </span>
        `;

        elemento.addEventListener(
            "click",
            function () {
                seleccionarInterno(interno);
            }
        );
        resultados.appendChild(elemento);
    });
    resultados.style.display = "block";
}

// SELECCIONAR INTERNO DESDE RESULTADOS
function seleccionarInterno(interno) {
    internoSeleccionado = interno;
    const campo = document.getElementById("interno");
    const resultados = document.getElementById("resultadosInternos");
    const nombreCompleto = interno.nombreCompleto || `${interno.nombre || ""} ${interno.apellido || ""}`;
    if (campo) {
        campo.value = nombreCompleto;
    }
    if (resultados) {
        resultados.innerHTML = "";
        resultados.style.display = "none";
    }
    mostrarDatosInterno(interno);
}

// BUSCAR / SELECCIONAR INTERNO
function buscarInterno() {
    const campo = document.getElementById("interno");
    if (!campo) return;
    const texto = campo.value.trim().toLowerCase();

    if (!texto) {
        mostrarMensaje(
            "Ingrese el nombre, DPI o número de interno.", "error"
        );
        return;
    }

    const coincidencias =
        internosDisponibles.filter(interno => {
            const nombreCompleto = (interno.nombreCompleto || `${interno.nombre || ""} ${interno.apellido || ""}`).toLowerCase();
            const nombre = (interno.nombre || "").toLowerCase();
            const apellido = (interno.apellido || "").toLowerCase();
            const dpi = (interno.dpi || "").toString().toLowerCase();
            const id = interno.id.toString().toLowerCase();
            return (
                nombreCompleto.includes(texto) ||
                nombre.includes(texto) ||
                apellido.includes(texto) ||
                dpi.includes(texto) ||
                id.includes(texto)
            );
        });

    if (coincidencias.length === 0) {
        internoSeleccionado = null;
        limpiarDatosInterno();
        mostrarMensaje(
            "No se encontró ningún interno con ese dato.", "error"
        );
        return;
    }

    if (coincidencias.length === 1) {
        seleccionarInterno(coincidencias[0]);
        return;
    }
    mostrarResultadosBusqueda();
}

// MOSTRAR DATOS DEL INTERNO
function mostrarDatosInterno(interno) {
    const nombre = document.getElementById("nombreInterno");
    const numero = document.getElementById("numeroInterno");
    const edad = document.getElementById("edadInterno");
    const fechaIngreso = document.getElementById("fechaIngresoInterno");
    const estado = document.getElementById("estadoInterno");
    const nombreCompleto = interno.nombreCompleto || `${interno.nombre || ""} ${interno.apellido || ""}`;

    if (nombre) {
        nombre.textContent = nombreCompleto;
    }
    if (numero) {
        numero.textContent =`Interno #${interno.id}`;
    }
    if (edad) {
        const edadCalculada = calcularEdad(interno.fechaNacimiento);
        edad.textContent =
            edadCalculada === "-"
                ? "-"
                : `${edadCalculada} años`;
    }
    if (fechaIngreso) {
        fechaIngreso.textContent = formatearFecha(interno.fechaIngreso);
    }
    if (estado) {
        estado.textContent = "Interno seleccionado";
    }
    const btnHistorial = document.getElementById("btnHistorial");
    if (btnHistorial) {
        btnHistorial.disabled = false;
    }
}

// LIMPIAR DATOS DEL INTERNO
function limpiarDatosInterno() {
    const nombre = document.getElementById("nombreInterno");
    const numero = document.getElementById("numeroInterno");
    const edad = document.getElementById("edadInterno");
    const fechaIngreso = document.getElementById("fechaIngresoInterno");
    const estado = document.getElementById("estadoInterno");

    if (nombre) {
        nombre.textContent = "Ningún interno seleccionado";
    }
    if (numero) {
        numero.textContent = "Seleccione un interno para continuar";
    }
    if (edad) {
        edad.textContent = "-";
    }
    if (fechaIngreso) {
        fechaIngreso.textContent = "-";
    }
    if (estado) {
        estado.textContent ="Sin seleccionar";
    }
    const btnHistorial = document.getElementById("btnHistorial");
    if (btnHistorial) {
        btnHistorial.disabled = true;
    }
}

// CALCULAR EDAD
function calcularEdad(fechaNacimiento) {
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
            mes === 0 &&
            hoy.getDate() < nacimiento.getDate()
        )
    ) {
        edad--;
    }
    return edad;
}

// FORMATEAR FECHA
function formatearFecha(fecha) {
    if (!fecha) {
        return "-";
    }
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

// CARGAR ESPECIALIDADES
async function cargarEspecialidades() {
    try {
        const respuesta = await fetch(`${API_BASE}/api/Especialidades`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las especialidades.");
        }
        const especialidades = await respuesta.json();
        const select = document.getElementById("especialidad");
        if (!select) return;
        select.innerHTML = `
            <option value="">
                Seleccionar especialidad
            </option>
        `;

        especialidades.forEach(
            especialidad => {
                const option = document.createElement("option");
                option.value = especialidad.id;
                option.textContent = especialidad.nombre;
                select.appendChild(option);
            }
        );
    } catch (error) {
        console.error(error);
        mostrarMensaje(
            "No se pudieron cargar las especialidades.", "error"
        );
    }
}

// CARGAR ENFERMEROS
async function cargarEnfermeros() {
    try {
        const respuesta = await fetch(`${API_BASE}/api/Usuarios/enfermeros`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los enfermeros.");
        }
        const enfermeros = await respuesta.json();
        const select = document.getElementById("enfermero");

        if (!select) return;
        select.innerHTML = `
            <option value="">
                Seleccionar enfermero(a)
            </option>
        `;

        enfermeros.forEach(
            enfermero => {
                const option = document.createElement("option");
                option.value = enfermero.id;
                option.textContent = enfermero.nombreCompleto;
                select.appendChild(option);
            }
        );
    } catch (error) {
        console.error(error);
        mostrarMensaje(
            "No se pudieron cargar los enfermeros.","error"
        );
    }
}

// MOSTRAR / OCULTAR CAMPOS DE ESPECIALISTA
function mostrarCamposEspecialista() {
    const checkbox = document.getElementById("requiereEspecialista");
    const campos = document.getElementById("camposEspecialista");
    if (!checkbox || !campos) return;

    if (checkbox.checked) {
        campos.style.display ="grid";
    } else {
        campos.style.display = "none";

        const especialidad = document.getElementById("especialidad");
        const enfermero = document.getElementById("enfermero");

        if (especialidad) {
            especialidad.value ="";
        }
        if (enfermero) {
            enfermero.value = "";
        }
    }
}

// MOSTRAR HISTORIAL MEDICO
async function mostrarHistorial() {
    if (!internoSeleccionado) {
        mostrarMensaje(
            "Primero debe seleccionar un interno.","error"
        );
        return;
    }
    const modal = document.getElementById("modalHistorial");
    const contenido = document.getElementById("contenidoHistorial");
    const titulo = document.getElementById("tituloHistorial");
    if (!modal || !contenido) return;

    if (titulo) {
        const nombre =  internoSeleccionado.nombreCompleto || `${internoSeleccionado.nombre || ""} ${internoSeleccionado.apellido || ""}`;
        titulo.textContent = `Evaluaciones médicas de ${nombre}`;
    }

    contenido.innerHTML = `
        <p class="cargando">
            Cargando historial médico...
        </p>
    `;
    modal.style.display = "flex";

    try {
        const respuesta = await fetch(`${API_BASE}/api/EvaluacionesMedicas/interno/${internoSeleccionado.id}`);
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el historial.");
        }

        const historial = await respuesta.json();
        if (historial.length === 0) {
            contenido.innerHTML = `
                <div class="historial-vacio">
                    <p>
                        Este interno todavía no tiene
                        evaluaciones médicas registradas.
                    </p>
                </div>
            `;
            return;
        }
        contenido.innerHTML = "";
        historial.forEach(
            evaluacion => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "historial-item";
                tarjeta.innerHTML = `
                    <div class="historial-header">
                        <strong>
                            Evaluación del
                            ${formatearFecha(
                                evaluacion.fechaEvaluacion
                            )}
                        </strong>

                        <span>
                            Médico general:
                            ${
                                evaluacion.medicoGeneral || "-"
                            }
                        </span>
                    </div>

                    <div class="historial-dato">
                        <strong>
                            Motivo de consulta:
                        </strong>

                        <span>
                            ${
                                evaluacion.motivoConsulta || "-"
                            }
                        </span>
                    </div>

                    <div class="historial-vitales">
                        <div>
                            <strong>
                                Presión
                            </strong>

                            ${
                                evaluacion.presionArterial || "-"
                            }
                        </div>

                        <div>
                            <strong>
                                Temperatura
                            </strong>

                            ${
                                evaluacion.temperatura ??
                                "-"
                            }
                            °C
                        </div>

                        <div>
                            <strong>
                                Frecuencia
                            </strong>

                            ${
                                evaluacion.frecuenciaCardiaca ??
                                "-"
                            }
                            bpm
                        </div>

                        <div>
                            <strong>
                                Saturación
                            </strong>

                            ${
                                evaluacion.saturacionOxigeno ??
                                "-"
                            }
                            %
                        </div>
                    </div>

                    <div class="historial-dato">
                        <strong>
                            Diagnóstico:
                        </strong>

                        <span>
                            ${
                                evaluacion.diagnostico || "-"
                            }
                        </span>
                    </div>

                    <div class="historial-dato">
                        <strong>
                            Indicaciones:
                        </strong>

                        <span>
                            ${
                                evaluacion.tratamiento || "-"
                            }
                        </span>
                    </div>

                    <div class="historial-dato">
                        <strong>
                            Observaciones:
                        </strong>

                        <span>
                            ${
                                evaluacion.observaciones || "-"
                            }
                        </span>
                    </div>

                    <div class="historial-dato">
                        <strong>
                            Requiere especialista:
                        </strong>

                        <span>
                            ${
                                evaluacion.requiereEspecialista
                                    ? "Sí"
                                    : "No"
                            }
                        </span>
                    </div>
                `;

                contenido.appendChild(
                    tarjeta
                );
            }
        );
    } catch (error) {
        console.error(error);

        contenido.innerHTML = `
            <div class="historial-error">
                <p>
                    ${error.message}
                </p>
            </div>
        `;
    }
}

// CERRAR MODAL
function cerrarModalHistorial() {
    const modal = document.getElementById("modalHistorial");

    if (modal) {
        modal.style.display = "none";
    }
}

// GUARDAR EVALUACION
async function guardarEvaluacion() {
    if (guardandoEvaluacion) {
        return;
    }
    if (!internoSeleccionado) {
        mostrarMensaje("Primero debe seleccionar un interno.", "error");
        return;
    }

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        mostrarMensaje("No se encontró el usuario médico en la sesión.", "error");
        return;
    }

    const motivo = document.getElementById("motivo").value.trim();
    const diagnostico = document.getElementById("diagnostico").value.trim();
    if (!motivo || !diagnostico) {
        mostrarMensaje("Debe ingresar el motivo de consulta y el diagnóstico.","error");
        return;
    }

    const requiereEspecialista = document.getElementById("requiereEspecialista").checked;
    let especialidadID = null;
    let enfermeroID = null;

    if (requiereEspecialista) {
        especialidadID = document.getElementById("especialidad").value;
        enfermeroID = document.getElementById("enfermero").value;
        if (!especialidadID) {
            mostrarMensaje("Debe seleccionar una especialidad.","error");
            return;
        }

        if (!enfermeroID) {
            mostrarMensaje("Debe seleccionar un enfermero(a).","error");
            return;
        }
    }

    const datos = {
        internoID: internoSeleccionado.id,
        medicoGeneralID: parseInt(usuarioId),
        motivoConsulta: motivo,
        presionArterial: document.getElementById("presion").value.trim() || null,
        temperatura: convertirNumero(document.getElementById("temperatura").value),
        frecuenciaCardiaca: convertirEntero(document.getElementById("frecuencia").value),
        saturacionOxigeno: convertirEntero(document.getElementById("saturacion").value),
        diagnostico: diagnostico,
        tratamiento: document.getElementById("tratamiento").value.trim() || null,
        observaciones: document.getElementById("observaciones").value.trim() || null,
        requiereEspecialista: requiereEspecialista,
        especialidadID: requiereEspecialista
                ? parseInt(especialidadID)
                : null,
        enfermeroID: requiereEspecialista
                ? parseInt(enfermeroID)
                : null
    };

    guardandoEvaluacion = true;
    const btnGuardar = document.getElementById("btnGuardar");
    if (btnGuardar) {
        btnGuardar.disabled = true;
    }

    try {
        const respuesta =
            await fetch(
                `${API_BASE}/api/EvaluacionesMedicas`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(datos)
                }
            );
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No se pudo registrar la evaluación."
            );
        }
        mostrarMensaje(resultado.mensaje, "exito");
        limpiarFormulario();
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    } finally {
        guardandoEvaluacion = false;
        if (btnGuardar) {
            btnGuardar.disabled = false;
        }
    }
}

// CONVERTIR DECIMAL
function convertirNumero(valor) {
    if (!valor) {
        return null;
    }

    const numero = parseFloat(valor);
    return isNaN(numero)
        ? null
        : numero;
}

// CONVERTIR ENTERO
function convertirEntero(valor) {
    if (!valor) {
        return null;
    }

    const numero = parseInt(valor);
    return isNaN(numero)
        ? null
        : numero;
}

// LIMPIAR FORMULARIO
function limpiarFormulario() {
    document.getElementById("motivo").value = "";
    document.getElementById("presion").value = "";
    document.getElementById("temperatura").value = "";
    document.getElementById("frecuencia").value = "";
    document.getElementById("saturacion").value = "";
    document.getElementById("diagnostico").value = "";
    document.getElementById("tratamiento").value = "";
    document.getElementById("observaciones").value = "";
    document.getElementById("requiereEspecialista").checked = false;
    document.getElementById("especialidad").value = "";
    document.getElementById("enfermero").value = "";
    mostrarCamposEspecialista();
}

// MENSAJES
function mostrarMensaje(mensaje, tipo) {
    alert(mensaje);
}

// CERRAR MODAL AL HACER CLIC FUERA
window.addEventListener(
    "click",
    function (event) {
        const modal = document.getElementById("modalHistorial");
        if (
            modal && event.target === modal
        ) {
            cerrarModalHistorial();
        }
    }
);