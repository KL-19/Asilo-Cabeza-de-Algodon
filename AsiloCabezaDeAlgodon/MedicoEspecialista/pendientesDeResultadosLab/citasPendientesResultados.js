function verResultados(idAtencion) {

    window.location.href =
        "../MisCitas/atenderPaciente.html?modo=resultados&id=" + idAtencion;

}

/* =========================================================
   BUSCAR PACIENTE
========================================================= */

const buscarPaciente = document.getElementById("buscarPaciente");

buscarPaciente.addEventListener("input", function () {

    const texto = this.value.toLowerCase();

    const filas = document.querySelectorAll("#tablaResultados tr");

    filas.forEach(function (fila) {

        const contenido = fila.textContent.toLowerCase();

        if (contenido.includes(texto)) {

            fila.style.display = "";

        } else {

            fila.style.display = "none";

        }

    });

});


/* =========================================================
   FILTRO DE ESTADO
========================================================= */

const filtroEstado = document.getElementById("filtroEstado");

filtroEstado.addEventListener("change", function () {

    const estado = this.value;

    const filas = document.querySelectorAll("#tablaResultados tr");

    filas.forEach(function (fila) {

        if (estado === "todos") {

            fila.style.display = "";

            return;

        }


        const textoFila = fila.textContent.toLowerCase();


        if (estado === "recibidos") {

            if (textoFila.includes("resultados recibidos")) {

                fila.style.display = "";

            } else {

                fila.style.display = "none";

            }

        }


        if (estado === "pendientes") {

            if (textoFila.includes("esperando resultados")) {

                fila.style.display = "";

            } else {

                fila.style.display = "none";

            }

        }

    });

});