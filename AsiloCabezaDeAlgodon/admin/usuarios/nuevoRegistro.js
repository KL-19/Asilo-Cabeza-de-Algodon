const formulario = document.getElementById("userForm");
const selectEspecialidad = document.getElementById("especialidad");

async function cargarEspecialidades() {
    try {
        const response = await fetch(
            "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Especialidades"
        );
        if (!response.ok) {
            throw new Error("No se pudieron obtener las especialidades.");
        }
        const especialidades = await response.json();
        especialidades.forEach(especialidad => {
            const option = document.createElement("option");
            option.value = especialidad.id;
            option.textContent = especialidad.nombre;
            selectEspecialidad.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar especialidades:", error);
    }
}
cargarEspecialidades();

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
        especialidadID: document.getElementById("especialidad").value
            ? parseInt(document.getElementById("especialidad").value)
            : null,
        activo: document.getElementById("activo").checked
    };

    console.log("Datos que se enviarán al API:", datosUsuario);

    try {
        const response = await fetch("https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api/Usuarios", {
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