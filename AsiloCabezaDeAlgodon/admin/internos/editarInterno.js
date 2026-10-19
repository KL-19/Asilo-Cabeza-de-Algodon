const formulario = document.getElementById("editarInternoForm");
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("id");

// CARGAR DATOS DEL INTERNO
async function cargarInterno() {
    if (!id) {
        alert("No se indicó el interno que desea editar.");
        window.location.href = "internos.html";
        return;
    }

    try {
        const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Internos");
        if (!response.ok) {
            throw new Error("Error al obtener los internos.");
        }
        const internos = await response.json();
        const interno = internos.find(
                function (item) { 
                    return item.id === parseInt(id);
                }
            );

        if (!interno) {
            alert("No se encontró el interno.");
            window.location.href = "internos.html";
            return;
        }

        // DATOS DEL INTERNO
        document.getElementById("nombre").value = interno.nombre || "";
        document.getElementById("apellido").value = interno.apellido || "";
        document.getElementById("fechaNacimiento").value = convertirFecha(interno.fechaNacimiento);
        document.getElementById("genero").value = interno.genero || "";
        document.getElementById("dpi").value = interno.dpi || "";
        document.getElementById("fechaIngreso").value = convertirFecha(interno.fechaIngreso);
        document.getElementById("direccion").value = interno.direccion || "";
        document.getElementById("telefono").value = interno.telefonoEmergencia || "";

        // DATOS DEL FAMILIAR
        if (interno.familiar) {
            document.getElementById("familiarNombre").value = interno.familiar.nombreCompleto || "";
            document.getElementById("parentesco").value = interno.familiar.parentesco || "";
            document.getElementById("familiarTelefono").value = interno.familiar.telefono || "";
            document.getElementById("familiarCorreo").value = interno.familiar.correo || "";
            document.getElementById("familiarDireccion").value = interno.familiar.direccion || "";
        }
    }
    catch (error) {
        console.error(
            "Error al cargar el interno:",
            error
        );
        alert("No se pudo cargar la información del interno.");
    }
}

// CONVERTIR FECHA
function convertirFecha(fecha) {
    if (!fecha) {
        return "";
    }
    return fecha.substring(0, 10);
}

// GUARDAR CAMBIOS
formulario.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const datos = {
            nombre: document.getElementById("nombre").value.trim(),
            apellido:document.getElementById("apellido").value.trim(),
            fechaNacimiento:document.getElementById("fechaNacimiento").value,
            genero:document.getElementById("genero").value,
            dpi:document.getElementById("dpi").value.trim(),
            fechaIngreso:document.getElementById("fechaIngreso").value,
            direccion:document.getElementById("direccion").value.trim(),
            telefono:document.getElementById("telefono").value.trim()
        };
        console.log(
            "Datos que se enviarán:", datos
        );

        try {
            const response =
                await fetch(
                    "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Internos/" + id,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(datos)
                    }
                );
            const resultado = await response.json();
            if (response.ok) {
                alert(resultado.mensaje);

                window.location.href = "internos.html";
            }
            else {
                alert(resultado.mensaje || "No se pudieron guardar los cambios.");
            }

        }catch (error) {
            console.error(
                "Error al editar:", error
            );
            alert("No se pudo conectar con el API.");
        }
    }
);

// INICIAR
cargarInterno();