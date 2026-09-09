const btnEvaluar = document.getElementById("btnEvaluar");
const btnSolicitud = document.getElementById("btnSolicitud");
const btnSolicitudes = document.getElementById("btnSolicitudes");


btnEvaluar.addEventListener("click", () => {

    alert("Aquí comenzará la evaluación médica del interno.");

});

btnSolicitud.addEventListener("click", () => {

    alert("Aquí se creará una solicitud para un médico especialista.");

});


btnSolicitudes.addEventListener("click", () => {

    alert("Aquí se mostrarán las solicitudes realizadas.");

});

function updateGreeting() {
        const greetingElement = document.getElementById('greeting');
        const currentHour = new Date().getHours();

        if (currentHour >= 5 && currentHour < 12) {
            greetingElement.textContent = '¡Buenos días!';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingElement.textContent = '¡Buenas tardes!';
        } else {
            greetingElement.textContent = '¡Buenas noches!';
        }
    }

    updateGreeting();
