document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const messageElement = document.getElementById('loginMessage');

    messageElement.className = "login-message";

    if (usernameInput === "" || passwordInput === "") {
        messageElement.textContent = "Debe completar todos los campos.";
        messageElement.style.color = "#f87171";
        return;
    }

    messageElement.textContent = "Verificando en SQL Server...";
    messageElement.style.color = "#60a5fa";

    try {
        const response = await fetch('http://localhost:5054/api/Auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: usernameInput,
                password: passwordInput
            })
        });

        // Manejo seguro por si la API responde error 500
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (response.ok) {
            messageElement.style.color = "#4ade80";
            messageElement.textContent = "¡Acceso correcto! Redirigiendo...";
            
            // Guardar datos en el navegador
            localStorage.setItem('usuarioLogueado', data.usuario);
            localStorage.setItem('rolUsuario', data.rol);
            localStorage.setItem('usuarioId', data.usuarioId);

            setTimeout(() => {
                switch (data.rol) {
                    case 'Administrador':
                        window.location.href = "admin/dashboard.html";
                        break;
                    case 'MedicoGeneral':
                        window.location.href = "MedicoGeneral/medicoGeneral.html";
                        break;
                    case 'Enfermero':
                        window.location.href = "Enfermero/Enfermero.html";
                        break;
                    case 'Fundacion':
                        window.location.href = "Fundacion/solicitudesP/solicitudesPendientes.html";
                        break;
                    case 'MedicoEspecialista':
                        window.location.href = "MedicoEspecialista/MisCitas/misCitas.html";
                        break;
                    case 'Laboratorio':
                        window.location.href = "Laboratorio/SolicitudesPendientes/SolicitudesPendientes.html";
                        break;
                    case 'Farmacia':
                        window.location.href = "Farmacia/registrarEntrega.html";
                        break;
                    default:
                        window.location.href = "dashboard.html";
                        break;
                }
            }, 1500);

        } else {
            messageElement.style.color = "#f87171";
            messageElement.textContent = data?.mensaje || "Error 500 en el servidor (SQL o Hash).";
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        messageElement.style.color = "#f87171";
        messageElement.textContent = "Error al procesar la respuesta.";
    }
});