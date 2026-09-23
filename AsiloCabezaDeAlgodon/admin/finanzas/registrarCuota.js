const formulario = document.getElementById("cuotaForm");
const internoInput = document.getElementById("interno");
const internoResults = document.getElementById("internoResults");
let internoSeleccionado = null;

// BUSCAR INTERNOS
internoInput.addEventListener("input", async function () {
    const texto = internoInput.value.trim();
    internoSeleccionado = null;
    if (texto === "") {
        internoResults.innerHTML = "";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5054/api/CuotasMensuales/internos?buscar="
            + encodeURIComponent(texto)
        );

        const internos = await response.json();
        internoResults.innerHTML = "";
        if (internos.length === 0) {
            internoResults.innerHTML = `
                <div class="autocomplete-no-results">
                    No se encontraron internos.
                </div>
            `;
            return;
        }

        internos.forEach(function (interno) {
            const resultado = document.createElement("div");
            resultado.classList.add("autocomplete-item");
            resultado.textContent = interno.nombre;
            resultado.addEventListener("click", function () {
                internoInput.value = interno.nombre;
                internoSeleccionado = interno;
                internoResults.innerHTML = "";
            });
            internoResults.appendChild(resultado);
        });
    } catch (error) {
        console.error("Error al buscar internos:", error);
    }
});

// REGISTRAR CUOTA
formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Verificar que realmente se haya seleccionado un interno de la lista.
    if (!internoSeleccionado) {
        alert("Seleccione un interno de la lista.");
        internoInput.focus();
        return;
    }

    const datosCuota = {
        internoID: internoSeleccionado.id,

        periodo: document.getElementById("mes").value,

        monto: parseFloat(
            document.getElementById("monto").value
        ),
        fechaPago: document.getElementById("fechaPago").value,

        metodoPago: document.getElementById("metodoPago").value,

        numeroReferencia:
            document.getElementById("referencia").value.trim(),

        observaciones:
            document.getElementById("observaciones").value.trim()
    };

    console.log(
        "Datos que se enviarán al API:",
        datosCuota
    );

    try {
        const response = await fetch(
            "http://localhost:5054/api/CuotasMensuales",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosCuota)
            }
        );

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensaje);
            formulario.reset();
            internoSeleccionado = null;
            internoResults.innerHTML = "";
        } else {
            alert(
                resultado.mensaje ||
                "Error al registrar la cuota."
            );
            console.log(resultado);
        }

    } catch (error) {
        console.error("Error:", error);
        alert(
            "No se pudo conectar con el API."
        );
    }

});