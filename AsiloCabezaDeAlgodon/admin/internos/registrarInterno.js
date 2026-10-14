const formulario = document.getElementById("formInterno");
const opcionesFamiliar = document.querySelectorAll('input[name="tipoFamiliar"]');
const familiarExistenteContainer = document.getElementById("familiarExistenteContainer");
const familiarExistente = document.getElementById("familiarExistente");
const camposFamiliar = [
    document.getElementById("familiarNombre"),
    document.getElementById("parentesco"),
    document.getElementById("familiarTelefono"),
    document.getElementById("familiarCorreo"),
    document.getElementById("familiarDireccion")
];

async function cargarFamiliares() {
    try {
        const response = await fetch(
            "http://localhost:5054/api/Familiares"
        );

        const familiares = await response.json();

        familiarExistente.innerHTML = `
            <option value="">Seleccione un familiar</option>
        `;

        familiares
            .filter(function (familiar) {
                return familiar.activo;
            })
            .forEach(function (familiar) {
                const opcion = document.createElement("option");
                opcion.value = familiar.id;
                opcion.textContent =
                    familiar.nombreCompleto +
                    " - " +
                    (familiar.parentesco || "Sin parentesco");
                opcion.dataset.nombre = familiar.nombreCompleto || "";
                opcion.dataset.parentesco = familiar.parentesco || "";
                opcion.dataset.telefono = familiar.telefono || "";
                opcion.dataset.correo = familiar.correo || "";
                opcion.dataset.direccion = familiar.direccion || "";
                familiarExistente.appendChild(opcion);
            });
    } catch (error) {
        console.error("Error al cargar familiares:", error);
    }
}

opcionesFamiliar.forEach(function (opcion) {
    opcion.addEventListener("change", function () {
        if (this.value === "existente") {
            familiarExistenteContainer.style.display = "block";
            camposFamiliar.forEach(function (campo) {
                campo.value = "";
                campo.disabled = true;
                campo.required = false;
            });

            cargarFamiliares();
        } else {
            familiarExistenteContainer.style.display = "none";
            familiarExistente.value = "";
            camposFamiliar.forEach(function (campo) {
                campo.disabled = false;
                campo.required =
                    campo.id !== "familiarDireccion";
            });
        }

    });

});

familiarExistente.addEventListener("change", function () {
    const opcionSeleccionada =this.options[this.selectedIndex];

    if (!this.value) {
        return;
    }
    document.getElementById("familiarNombre").value =opcionSeleccionada.dataset.nombre;
    document.getElementById("parentesco").value = opcionSeleccionada.dataset.parentesco;
    document.getElementById("familiarTelefono").value = opcionSeleccionada.dataset.telefono;
    document.getElementById("familiarCorreo").value = opcionSeleccionada.dataset.correo;
    document.getElementById("familiarDireccion").value = opcionSeleccionada.dataset.direccion;
});

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
        fechaNacimiento:document.getElementById("fechaNacimiento").value,
        genero:document.getElementById("genero").value,
        dpi:document.getElementById("dpi").value.trim(),
        fechaIngreso:document.getElementById("fechaIngreso").value,
        direccion: document.getElementById("direccion").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),

        // Datos del familiar
        familiarID: document.getElementById("familiarExistente").value || null,
        familiarNombre: document.getElementById("familiarNombre").value.trim(),
        parentesco:document.getElementById("parentesco").value,
        familiarTelefono: document.getElementById("familiarTelefono").value.trim(),
        familiarCorreo: document.getElementById("familiarCorreo").value.trim(),
        familiarDireccion: document.getElementById("familiarDireccion").value.trim(),

        // Información médica
        psicopatologia: document.getElementById("psicopatologia").value.trim(),
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

        const respuestaTexto = await response.text();
        console.log("Código HTTP:", response.status);
        console.log("Respuesta del API:", respuestaTexto);
        
        let resultado;
        try {
            resultado = JSON.parse(respuestaTexto);
        } catch {
            resultado = { mensaje: respuestaTexto };
        }
        
        if (response.ok) {
            alert(resultado.mensaje || "Interno registrado correctamente.");
            formulario.reset();
        } else {
            alert("Error del API: " + (resultado.mensaje || "No se pudo completar la operación."));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el API.");
    }

});