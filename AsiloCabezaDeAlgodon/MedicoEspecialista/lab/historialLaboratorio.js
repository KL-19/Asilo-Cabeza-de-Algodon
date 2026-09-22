function verResultado(idAtencion, paciente, expediente, examen, fecha) {

    document.getElementById("modalTitulo").textContent = examen;
    document.getElementById("modalPaciente").textContent = paciente;
    document.getElementById("modalInterno").textContent = "Interno " + expediente;
    document.getElementById("modalAtencion").textContent = idAtencion;

    // Convertir la fecha
    const partes = fecha.split("-");
    const fechaFormateada = partes[2] + " Sep " + partes[0];

    document.getElementById("modalFecha").textContent = fechaFormateada;

    // Resultados de ejemplo
    const resultadoCampos = document.getElementById("resultadoCampos");

    if (examen === "Hemograma") {

        resultadoCampos.innerHTML = `
            <div class="result-item">
                <span>Hemoglobina</span>
                <strong>13.8 g/dL</strong>
            </div>

            <div class="result-item">
                <span>Hematocrito</span>
                <strong>41 %</strong>
            </div>

            <div class="result-item">
                <span>Glóbulos blancos</span>
                <strong>7,200 /µL</strong>
            </div>

            <div class="result-item">
                <span>Plaquetas</span>
                <strong>245,000 /µL</strong>
            </div>
        `;

        document.getElementById("modalObservaciones").textContent =
            "Resultado dentro de los parámetros esperados.";

    } else if (examen === "Examen de orina") {

        resultadoCampos.innerHTML = `
            <div class="result-item">
                <span>Color</span>
                <strong>Amarillo</strong>
            </div>

            <div class="result-item">
                <span>Aspecto</span>
                <strong>Claro</strong>
            </div>

            <div class="result-item">
                <span>Proteínas</span>
                <strong>Negativo</strong>
            </div>

            <div class="result-item">
                <span>Glucosa</span>
                <strong>Negativo</strong>
            </div>
        `;

        document.getElementById("modalObservaciones").textContent =
            "No se encontraron alteraciones relevantes.";

    } else if (examen === "Perfil lipídico") {

        resultadoCampos.innerHTML = `
            <div class="result-item">
                <span>Colesterol total</span>
                <strong>185 mg/dL</strong>
            </div>

            <div class="result-item">
                <span>HDL</span>
                <strong>52 mg/dL</strong>
            </div>

            <div class="result-item">
                <span>LDL</span>
                <strong>110 mg/dL</strong>
            </div>

            <div class="result-item">
                <span>Triglicéridos</span>
                <strong>115 mg/dL</strong>
            </div>
        `;

        document.getElementById("modalObservaciones").textContent =
            "Valores registrados para seguimiento médico.";

    } else if (examen === "Glucosa") {

        resultadoCampos.innerHTML = `
            <div class="result-item">
                <span>Glucosa</span>
                <strong>96 mg/dL</strong>
            </div>
        `;

        document.getElementById("modalObservaciones").textContent =
            "Resultado dentro del rango esperado.";
    }

    document.getElementById("resultadoModal").classList.add("show");
}


function cerrarResultado() {
    document.getElementById("resultadoModal").classList.remove("show");
}


// Cerrar al hacer clic fuera del modal
document.getElementById("resultadoModal").addEventListener("click", function(event) {

    if (event.target === this) {
        cerrarResultado();
    }

});