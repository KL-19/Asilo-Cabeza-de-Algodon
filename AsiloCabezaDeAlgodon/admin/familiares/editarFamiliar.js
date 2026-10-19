const formulario = document.getElementById("editarFamiliarForm");
const internosAsociados = document.getElementById("internosAsociados");
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("id");

// CARGAR FAMILIAR
async function cargarFamiliar() {
    if (!id) {
        alert("No se encontró el familiar.");
        window.location.href ="familiares.html";
        return;
    }
    try {
        const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Familiares/" + id);

        if (!response.ok) {
            throw new Error("No se pudo obtener el familiar.");
        }
        const familiar = await response.json();

        // DATOS DEL FAMILIAR
        document.getElementById("nombreCompleto").value = familiar.nombreCompleto || "";
        document.getElementById("parentesco").value = familiar.parentesco || "";
        document.getElementById("telefono").value = familiar.telefono || "";
        document.getElementById("correo").value = familiar.correo || "";
        document.getElementById("direccion").value = familiar.direccion || "";

        // INTERNOS ASOCIADOS
        internosAsociados.innerHTML = "";

        if (
            familiar.internos && familiar.internos.length > 0
        ) {
            familiar.internos.forEach(
                function (interno) {
                    const elemento = document.createElement("div");
                    elemento.className = "interno-item";

                    const estado =
                        interno.activo
                            ? "Activo"
                            : "Inactivo";

                    const claseEstado =
                        interno.activo
                            ? "active"
                            : "inactive";

                    elemento.innerHTML = `
                        <div class="interno-info">
                            <div class="interno-icon">
                                <i class="ph ph-user"></i>
                            </div>

                            <div>
                                <strong>
                                    ${interno.nombreCompleto}
                                </strong>

                                <span>
                                    Interno asociado
                                </span>
                            </div>
                        </div>

                        <span class="estado ${claseEstado}">
                            ${estado}
                        </span>
                    `;
                    internosAsociados.appendChild(elemento);
                }
            );

        } else {
            internosAsociados.innerHTML = `
                <div class="sin-internos">
                    No tiene internos asociados.
                </div>
            `;
        }
    } catch (error) {
        console.error("Error al cargar familiar:", error);
        alert("No se pudo cargar la información del familiar.");
        window.location.href = "familiares.html";
    }
}

// GUARDAR CAMBIOS
formulario.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const datos = {
            nombreCompleto:
                document
                    .getElementById("nombreCompleto")
                    .value
                    .trim(),
            parentesco:
                document
                    .getElementById("parentesco")
                    .value,
            telefono:
                document
                    .getElementById("telefono")
                    .value
                    .trim(),
            correo:
                document
                    .getElementById("correo")
                    .value
                    .trim(),
            direccion:
                document
                    .getElementById("direccion")
                    .value
                    .trim()
        };

        try {
            const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Familiares/" + id,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(datos)
                    }
                );

            const resultado = await response.json();
            if (response.ok) {
                alert(
                    resultado.mensaje ||"Familiar actualizado correctamente."
                );
                window.location.href = "familiares.html";
            } else {
                alert(
                    resultado.mensaje || "No se pudieron guardar los cambios."
                );
                console.log(resultado);
            }
        } catch (error) {
            console.error(
                "Error al actualizar familiar:", error
            );
            alert("No se pudo conectar con el API.");
        }
    }
);

// INICIAR
cargarFamiliar();