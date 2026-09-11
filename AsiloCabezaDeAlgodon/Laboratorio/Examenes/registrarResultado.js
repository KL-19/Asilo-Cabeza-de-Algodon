/* datos temporales para la simulacion*/

const examenActual = "hemograma";



const tiposExamen = {

    hemograma: {

        nombre: "Hemograma completo",

        campos: [
            {
                id: "hemoglobina",
                nombre: "Hemoglobina",
                tipo: "number",
                unidad: "g/dL",
                placeholder: "Ej. 13.2",
                step: "0.1"
            },

            {
                id: "hematocrito",
                nombre: "Hematocrito",
                tipo: "number",
                unidad: "%",
                placeholder: "Ej. 40",
                step: "0.1"
            },

            {
                id: "leucocitos",
                nombre: "Leucocitos",
                tipo: "number",
                unidad: "/µL",
                placeholder: "Ej. 7200"
            },

            {
                id: "plaquetas",
                nombre: "Plaquetas",
                tipo: "number",
                unidad: "/µL",
                placeholder: "Ej. 250000"
            }
        ]
    },


    orina: {

        nombre: "Examen general de orina",

        campos: [
            {
                id: "color",
                nombre: "Color",
                tipo: "text",
                unidad: "",
                placeholder: "Ej. Amarillo"
            },

            {
                id: "aspecto",
                nombre: "Aspecto",
                tipo: "text",
                unidad: "",
                placeholder: "Ej. Claro"
            },

            {
                id: "ph",
                nombre: "pH",
                tipo: "number",
                unidad: "",
                placeholder: "Ej. 6.0",
                step: "0.1"
            },

            {
                id: "densidad",
                nombre: "Densidad",
                tipo: "number",
                unidad: "",
                placeholder: "Ej. 1.020",
                step: "0.001"
            },

            {
                id: "proteinas",
                nombre: "Proteínas",
                tipo: "text",
                unidad: "",
                placeholder: "Ej. Negativo"
            },

            {
                id: "glucosa",
                nombre: "Glucosa",
                tipo: "text",
                unidad: "",
                placeholder: "Ej. Negativo"
            }
        ]
    },


    perfilLipidico: {

        nombre: "Perfil lipídico",

        campos: [
            {
                id: "colesterolTotal",
                nombre: "Colesterol total",
                tipo: "number",
                unidad: "mg/dL",
                placeholder: "Ej. 180"
            },

            {
                id: "hdl",
                nombre: "HDL",
                tipo: "number",
                unidad: "mg/dL",
                placeholder: "Ej. 55"
            },

            {
                id: "ldl",
                nombre: "LDL",
                tipo: "number",
                unidad: "mg/dL",
                placeholder: "Ej. 105"
            },

            {
                id: "trigliceridos",
                nombre: "Triglicéridos",
                tipo: "number",
                unidad: "mg/dL",
                placeholder: "Ej. 100"
            }
        ]
    }
};



function cargarExamen() {

    const examen = tiposExamen[examenActual];

    if (!examen) {
        console.error("No se encontró el tipo de examen.");
        return;
    }

    document.getElementById("nombreExamen").textContent =
        examen.nombre;

    const container =
        document.getElementById("resultadosContainer");

    container.innerHTML = "";


    examen.campos.forEach(campo => {

        const field = document.createElement("div");

        field.classList.add("field-group");

        field.innerHTML = `
            <label for="${campo.id}">
                ${campo.nombre}
            </label>

            <div class="input-unit">

                <input
                    type="${campo.tipo}"
                    id="${campo.id}"
                    placeholder="${campo.placeholder}"
                    ${campo.step ? `step="${campo.step}"` : ""}
                >

                ${
                    campo.unidad
                    ? `<span>${campo.unidad}</span>`
                    : ""
                }

            </div>
        `;

        container.appendChild(field);
    });
}



function cancelarRegistro() {

    window.location.href = "../Examenes/Examenes.html";
}


/* simulacion del registro */

function registrarResultado() {

    const examen = tiposExamen[examenActual];

    if (!examen) {
        return;
    }


    const resultados = {};

    let completo = true;


    examen.campos.forEach(campo => {

        const input =
            document.getElementById(campo.id);

        if (!input) {
            return;
        }

        const valor = input.value.trim();

        if (valor === "") {
            completo = false;

            input.style.borderColor = "#ef4444";

        } else {

            input.style.borderColor = "";

            resultados[campo.id] = valor;
        }
    });


    if (!completo) {

        alert(
            "Complete todos los campos del resultado antes de registrarlo."
        );

        return;
    }



    resultados.observaciones =
        document.getElementById("observaciones").value.trim();


    /*  */

    console.log("Resultado a registrar:", {
        atencionId: "AT-00125",
        internoId: "0025",
        examen: examen.nombre,
        resultados: resultados
    });



    const successMessage =
        document.getElementById("successMessage");

    successMessage.classList.add("show");



    setTimeout(() => {

        window.location.href = "../Examenes/Examenes.html";

    }, 1800);
}

document.addEventListener("DOMContentLoaded", () => {

    cargarExamen();

});