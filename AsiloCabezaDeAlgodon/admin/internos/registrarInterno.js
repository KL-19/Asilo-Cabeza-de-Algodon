const formulario = document.getElementById("formInterno");

// agregar medicamento
function agregarMedicamento() {
    const contenedor = document.getElementById("medicamentosContainer");
    const medicamento = document.createElement("div");
    medicamento.classList.add("medicamento-item");

    medicamento.innerHTML = `
        <div class="form-group">
            <label>Medicamento</label>
            <input
                type="text"
                class="medicamento"
                placeholder="Nombre del medicamento"
            >
        </div>

        <div class="form-group">
            <label>Cantidad</label>
            <input
                type="text"
                class="cantidad"
                placeholder="Ej. 20 tabletas"
            >
        </div>

        <div class="form-group">
            <label>Frecuencia</label>
            <input
                type="text"
                class="frecuencia"
                placeholder="Ej. Cada 8 horas"
            >
        </div>

        <div class="form-group">
            <label>Tiempo de aplicación</label>
            <input
                type="text"
                class="tiempo"
                placeholder="Ej. 5 días"
            >
        </div>
        <button
            type="button"
            class="btn-remove-medicine"
            onclick="this.parentElement.remove()"
        >
            Eliminar medicamento
        </button>
    `;
    contenedor.appendChild(medicamento);
}

// Enviar formulario
formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    // recopilar medicamentos
    const medicamentos = [];
    const medicamentosItems =
        document.querySelectorAll(".medicamento-item");

    medicamentosItems.forEach(function (item) {
        const nombre = item.querySelector(".medicamento").value.trim();
        const cantidad = item.querySelector(".cantidad").value.trim();
        const frecuencia = item.querySelector(".frecuencia").value.trim();
        const tiempo = item.querySelector(".tiempo").value.trim();

        // Solo agregamos el medicamento si tiene nombre
        if (nombre !== "") {
            medicamentos.push({
                medicamento: nombre,
                cantidad: cantidad,
                frecuencia: frecuencia,
                tiempoAplicacion: tiempo
            });
        }
    });

    const datosInterno = {
        // Datos del interno
        nombre: document.getElementById("nombre").value.trim(),

        apellido: document.getElementById("apellido").value.trim(),

        fechaNacimiento:
            document.getElementById("fechaNacimiento").value,

        genero:
            document.getElementById("genero").value,

        dpi:
            document.getElementById("dpi").value.trim(),

        fechaIngreso:
            document.getElementById("fechaIngreso").value,

        direccion:
            document.getElementById("direccion").value.trim(),

        telefono:
            document.getElementById("telefono").value.trim(),

        // Datos del familiar
        familiarNombre:
            document.getElementById("familiarNombre").value.trim(),

        parentesco:
            document.getElementById("parentesco").value,

        familiarTelefono:
            document.getElementById("familiarTelefono").value.trim(),

        familiarCorreo:
            document.getElementById("familiarCorreo").value.trim(),

        familiarDireccion:
            document.getElementById("familiarDireccion").value.trim(),

        // Información médica
        psicopatologia:
            document.getElementById("psicopatologia").value.trim(),
        medicamentos: medicamentos
    };

    // enviar al Api
    try {
        const response = await fetch(
            "http://localhost:5054/api/Internos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosInterno)
            }
        );

        const resultado = await response.json();
        
        // respuesta del Api
        if (response.ok) {
            alert(resultado.mensaje);
            formulario.reset();
        } else {
            alert("Error al registrar el interno.");
            console.log(resultado);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el API.");
    }

});