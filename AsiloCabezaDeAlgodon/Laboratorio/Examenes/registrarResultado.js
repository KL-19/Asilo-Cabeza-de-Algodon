const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
let examenId = null;
let examenActual = null;

document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);
    examenId = parametros.get("examenId");
    if (!examenId) {
        alert("No se indicó el examen que se desea procesar.");
        window.location.href = "Examenes.html";
        return;
    }
    cargarExamen();
});

async function cargarExamen() {
    try {
        const respuesta = await fetch(`${API}/ResultadosLaboratorio/examen/${examenId}`);
        if (!respuesta.ok) {
            const mensajeError = await obtenerMensajeError(respuesta);
            throw new Error(mensajeError);
        }

        const datos = await respuesta.json();
        if (!datos.examen) {
            throw new Error("El examen no fue encontrado.");
        }
        examenActual = datos.examen;
        mostrarInformacionExamen(examenActual);

        if (datos.existe && datos.resultado) {
            cargarResultadoExistente(datos.resultado);
        }
    }
    catch (error) {
        console.error("Error al cargar el examen:",error);
        alert(error.message || "No fue posible cargar el examen.");
        window.location.href = "Examenes.html";
    }
}

function mostrarInformacionExamen(examen) {
    const nombrePaciente = document.getElementById("nombrePaciente");
    if (nombrePaciente) {
        nombrePaciente.textContent = examen.internoNombre || "Sin nombre";
    }

    const numeroInterno = document.getElementById("numeroInterno");
    if (numeroInterno) {
        numeroInterno.textContent = `Interno #${formatearNumeroInterno(examen.internoId)}`;
    }

    const atencionId = document.getElementById("atencionId");
    if (atencionId) {
        atencionId.textContent = `AT-${String(examen.atencionMedicaID).padStart(5, "0")}`;
    }

    const atencionTexto = document.getElementById("atencionTexto");
    if (atencionTexto) {
        atencionTexto.textContent = `AT-${String(examen.atencionMedicaID).padStart(5, "0")}`;
    }

    const fechaExamen = document.getElementById("fechaExamen");
    if (fechaExamen) {
        fechaExamen.textContent = formatearFecha(examen.fechaTomaMuestra || examen.fechaSolicitud);
    }

    const nombreExamen = document.getElementById("nombreExamen");
    if (nombreExamen) {
        nombreExamen.textContent = examen.tipoExamen || "Examen de laboratorio";
    }

    const estadoExamen = document.getElementById("estadoExamen");
    if (estadoExamen) {
        estadoExamen.textContent = examen.estado || "En proceso";
    }
}

function cargarResultadoExistente(resultado) {
    const campoResultado = document.getElementById("resultado");
    const campoObservaciones = document.getElementById("observaciones");
    if (campoResultado) {
        campoResultado.value = resultado.resultado || "";
    }

    if (campoObservaciones) {
        campoObservaciones.value = resultado.observaciones || "";
    }
}

async function registrarResultado() {
    if (!examenActual) {
        alert("No se ha cargado la información del examen.");
        return;
    }
    const campoResultado =document.getElementById("resultado");
    const campoObservaciones = document.getElementById("observaciones");
    const resultado = campoResultado 
            ? campoResultado.value.trim() 
            : "";
    const observaciones = campoObservaciones
            ? campoObservaciones.value.trim()
            : "";

    if (!resultado) {
        alert("Debe ingresar el resultado del examen.");
        if (campoResultado) {
            campoResultado.focus();
        }
        return;
    }

    const boton = document.querySelector(".btn-save");
    try {
        if (boton) {
            boton.disabled = true;
            boton.innerHTML = `
                <i class="ph ph-spinner"></i>
                Guardando...
            `;
        }

        const datosEnviar = {
            examenLaboratorioID: examenActual.id,
            resultado: resultado,
            observaciones: observaciones
        };
        console.log("Datos enviados al API:",datosEnviar);
    
        const respuesta =
            await fetch(
                `${API}/ResultadosLaboratorio`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            datosEnviar
                        )
                }
            );
        const contenido = await obtenerRespuesta(respuesta);

        if (!respuesta.ok) {
            throw new Error(contenido.mensaje || `Error ${respuesta.status} al registrar el resultado.`);
        }

        console.log("Resultado registrado:",contenido);
        mostrarMensajeExito();
        setTimeout(() => {
            window.location.href = "Examenes.html";
        }, 1800);
    }
    catch (error) {
        console.error("Error al registrar resultado:",error);
        alert(error.message || "Ocurrió un error al registrar el resultado.");

        if (boton) {
            boton.disabled = false;
            boton.innerHTML = `
                <i class="ph ph-check"></i>
                Registrar resultado
            `;
        }
    }
}

async function obtenerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    }
    catch (error) {
        console.error("La API no devolvió JSON válido:", texto);
        return {
            mensaje:`El servidor devolvió una respuesta no válida: ${texto}`
        };
    }
}

async function obtenerMensajeError(respuesta) {
    const contenido = await obtenerRespuesta(respuesta);
    return (
        contenido.mensaje ||
        contenido.title || `Error ${respuesta.status}: ${respuesta.statusText}`
    );
}

function cancelarRegistro() {
    window.location.href = "Examenes.html";
}

function mostrarMensajeExito() {
    const mensaje = document.getElementById("successMessage");
    if (!mensaje) {
        return;
    }
    mensaje.classList.add("show");
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
            month: "2-digit",
            year: "numeric"
        }
    );
}

function formatearNumeroInterno(id) {
    if (
        id === null || id === undefined
    ) {
        return "----";
    }

    return String(id).padStart(
        4,
        "0"
    );
}