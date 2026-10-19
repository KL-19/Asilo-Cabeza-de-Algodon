const formulario = document.getElementById("gastoForm");

const usuarioId = parseInt(localStorage.getItem("usuarioId"));

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const gasto = {
        tipoGasto: document.getElementById("tipoGasto").value,
        fechaGasto: document.getElementById("fechaGasto").value,
        monto: parseFloat(document.getElementById("monto").value),
        proveedorBeneficiario: document.getElementById("proveedor").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        metodoPago: document.getElementById("metodoPago").value,
        numeroReferencia: document.getElementById("referencia").value.trim(),
        observaciones: document.getElementById("observaciones").value.trim(),
        registradoPorUsuarioID: usuarioId
    };

    console.log("Datos que se enviarán al API:", gasto);

    try {
        const response = await fetch(
            "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/GastosOperativos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(gasto)
            }
        );

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensaje);
            formulario.reset();
        } else {
            alert("Error al registrar el gasto.");
            console.log(resultado);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el API.");
    }
});