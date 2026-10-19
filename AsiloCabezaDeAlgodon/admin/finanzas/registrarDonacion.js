const formulario = document.getElementById("donationForm");
const usuarioId = parseInt(localStorage.getItem('usuarioId'));

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const donacion = {
        tipoDonante: document.getElementById("tipoDonante").value,
        nombreDonante: document.getElementById("nombreDonante").value,
        telefono: document.getElementById("contacto").value,
        correo: document.getElementById("correo").value,
        monto: parseFloat(document.getElementById("monto").value),
        formaRecepcion: document.getElementById("formaPago").value,
        fechaRecepcion: document.getElementById("fecha").value,
        numeroReferencia: document.getElementById("referencia").value,
        observaciones: document.getElementById("observaciones").value,
        registradoPorUsuarioID: usuarioId
    };

    try {
        const response = await fetch('https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Donaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donacion)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensaje);

            formulario.reset();
        } else {
            alert("Error al registrar la donación.");
            console.log(resultado);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el API.");
    }
});