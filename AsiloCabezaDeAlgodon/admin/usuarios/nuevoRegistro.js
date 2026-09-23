const formulario = document.getElementById("userForm");

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const datosUsuario = {
        nombreCompleto: document.getElementById("nombreCompleto").value.trim(),
        nombreUsuario: document.getElementById("nombreUsuario").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        password: document.getElementById("password").value,
        rolId: parseInt(document.getElementById("rol").value),
        numeroColegiado: document.getElementById("numeroColegiado").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        activo: document.getElementById("activo").checked
    };

    console.log("Datos que se enviarán al API:", datosUsuario);

    try {
        const response = await fetch("http://localhost:5054/api/Usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosUsuario)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensaje);
            formulario.reset();
        } else {
            alert(resultado.mensaje || "Error al registrar el usuario.");
            console.log(resultado);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el API.");
    }
});