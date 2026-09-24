const formulario = document.getElementById("editarUsuarioForm");
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("id");

// CARGAR USUARIO
async function cargarUsuario() {
    if (!id) {
        alert("No se indicó el usuario que desea editar.");
        window.location.href = "usuarios.html";
        return;
    }
    try {
        const response =await fetch("http://localhost:5054/api/Usuarios");
        if (!response.ok) {
            throw new Error("No se pudieron obtener los usuarios.");
        }
        const usuarios = await response.json();
        const usuario =
            usuarios.find(
                function (item) {
                    return item.id === parseInt(id);
                }
            );

        if (!usuario) {
            alert("No se encontró el usuario.");
            window.location.href ="usuarios.html";
            return;
        }
        
        // DATOS
        document.getElementById("nombreCompleto").value = usuario.nombreCompleto || "";
        document.getElementById("nombreUsuario").value = usuario.nombreUsuario || "";
        document.getElementById("correo").value = usuario.correo || "";
        document.getElementById("rolId").value = usuario.rolId || "";
  
        // PERFIL
        if (usuario.perfil) {
            document.getElementById("numeroColegiado").value = usuario.perfil.numeroColegiado || "";
            document.getElementById("telefono").value = usuario.perfil.telefono || "";
            document.getElementById("especialidad").value = usuario.perfil.especialidad || "";
        }
    }
    catch (error) {
        console.error(
            "Error al cargar usuario:", error
        );
        alert("No se pudo cargar la información del usuario.");
    }
}

// GUARDAR CAMBIOS
formulario.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        const datos = {
            nombreCompleto:document.getElementById("nombreCompleto").value.trim(),
            nombreUsuario:document.getElementById("nombreUsuario").value.trim(),
            correo:document.getElementById("correo").value.trim(),
            password:document.getElementById("password").value.trim(),
            rolId:parseInt(document.getElementById("rolId").value),
            numeroColegiado:document.getElementById("numeroColegiado").value.trim(),
            telefono:document.getElementById("telefono").value.trim(),
            especialidad:document.getElementById("especialidad").value.trim()
        };

        try {
            const response = await fetch("http://localhost:5054/api/Usuarios/" + id,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify(datos)
                    }
                );
            const resultado = await response.json();
            if (response.ok) {
                alert(
                    resultado.mensaje
                );
                window.location.href = "usuarios.html";
            }
            else {
                alert(
                    resultado.mensaje || "No se pudieron guardar los cambios."
                );
            }
        }
        catch (error) {
            console.error(
                "Error al editar usuario:", error
            );
            alert("No se pudo conectar con el API.");
        }
    }
);

// INICIAR
cargarUsuario();