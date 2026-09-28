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


    /* =================================================
SALUDO DINÁMICO
================================================== */

function updateGreeting() {

const greetingElement =
    document.getElementById("greeting");

const currentHour =
    new Date().getHours();


if (currentHour >= 5 && currentHour < 12) {

    greetingElement.textContent =
        "¡Buenos días!";

}
else if (currentHour >= 12 && currentHour < 18) {

    greetingElement.textContent =
        "¡Buenas tardes!";

}
else {

    greetingElement.textContent =
        "¡Buenas noches!";

}

}

updateGreeting();

/* =================================================
NOTIFICACIÓN
================================================== */

const btnNotificacion =
document.getElementById("btnNotificacion");

if (btnNotificacion) {

btnNotificacion.addEventListener("click", () => {

    /*
     * Más adelante esta notificación vendrá
     * directamente desde la API.
     *
     * Solamente se generará cuando:
     *
     * 1. El interno tenga una asignación.
     * 2. La Fundación haya asignado médico.
     * 3. La Fundación haya asignado fecha.
     * 4. La Fundación haya asignado hora.
     *
     * En ese momento la asignación pasa
     * a estado "Programada".
     */

    alert(
        "Tienes una nueva asignación programada. Revisa tus próximas atenciones."
    );


    const asignaciones =
        document.getElementById("misAsignaciones");


    if (asignaciones) {

        asignaciones.scrollIntoView({
            behavior: "smooth"
        });

    }

});

}

/* =================================================
BOTÓN VER ASIGNACIONES
================================================== */

const linksAsignaciones =
document.querySelectorAll(
'a[href="#misAsignaciones"]'
);

linksAsignaciones.forEach(link => {


link.addEventListener("click", () => {

    const asignaciones =
        document.getElementById("misAsignaciones");


    if (asignaciones) {

        asignaciones.scrollIntoView({
            behavior: "smooth"
        });

    }

});

});

/* =================================================
BOTÓN FILTRAR
================================================== */

const btnFiltrar =
document.getElementById("btnFiltrar");

if (btnFiltrar) {

btnFiltrar.addEventListener("click", () => {

    alert(
        "Los filtros se conectarán con las asignaciones registradas en el sistema."
    );

});

}
