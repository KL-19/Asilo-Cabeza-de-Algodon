function filtrarHistorial() {

    const interno =
        document
            .getElementById("buscar")
            .value
            .trim();

    const tipoExamen =
        document
            .getElementById("tipoExamen")
            .value;

    const desde =
        document
            .getElementById("desde")
            .value;

    const hasta =
        document
            .getElementById("hasta")
            .value;


    console.log("Filtros del historial:", {

        interno: interno,

        tipoExamen: tipoExamen,

        desde: desde,

        hasta: hasta

    });

    alert(
        "Filtros aplicados correctamente."
    );

}
const resultadosExamenes = {

    hemograma: {
        titulo: "Hemograma completo",
        paciente: "María López García",
        interno: "#0025",
        atencion: "AT-00125",
        fecha: "10 Sep 2026",

        resultados: [
            {
                nombre: "Hemoglobina",
                valor: "13.2",
                unidad: "g/dL"
            },
            {
                nombre: "Hematocrito",
                valor: "40",
                unidad: "%"
            },
            {
                nombre: "Leucocitos",
                valor: "7,200",
                unidad: "/µL"
            },
            {
                nombre: "Plaquetas",
                valor: "250,000",
                unidad: "/µL"
            }
        ],

        observaciones:
            "Resultado dentro de los parámetros esperados."
    },


    orina: {
        titulo: "Examen general de orina",
        paciente: "José Ramírez",
        interno: "#0018",
        atencion: "AT-00118",
        fecha: "08 Sep 2026",

        resultados: [
            {
                nombre: "Color",
                valor: "Amarillo",
                unidad: ""
            },
            {
                nombre: "Aspecto",
                valor: "Claro",
                unidad: ""
            },
            {
                nombre: "pH",
                valor: "6.0",
                unidad: ""
            },
            {
                nombre: "Densidad",
                valor: "1.020",
                unidad: ""
            },
            {
                nombre: "Proteínas",
                valor: "Negativo",
                unidad: ""
            },
            {
                nombre: "Glucosa",
                valor: "Negativo",
                unidad: ""
            }
        ],

        observaciones:
            "No se encontraron alteraciones relevantes en la muestra."
    },


    lipidos: {
        titulo: "Perfil lipídico",
        paciente: "Pedro González",
        interno: "#0031",
        atencion: "AT-00110",
        fecha: "05 Sep 2026",

        resultados: [
            {
                nombre: "Colesterol total",
                valor: "180",
                unidad: "mg/dL"
            },
            {
                nombre: "HDL",
                valor: "55",
                unidad: "mg/dL"
            },
            {
                nombre: "LDL",
                valor: "105",
                unidad: "mg/dL"
            },
            {
                nombre: "Triglicéridos",
                valor: "100",
                unidad: "mg/dL"
            }
        ],

        observaciones:
            "Valores registrados para seguimiento médico."
    },


    hemogramaAna: {
        titulo: "Hemograma completo",
        paciente: "Ana Martínez",
        interno: "#0012",
        atencion: "AT-00105",
        fecha: "02 Sep 2026",

        resultados: [
            {
                nombre: "Hemoglobina",
                valor: "12.8",
                unidad: "g/dL"
            },
            {
                nombre: "Hematocrito",
                valor: "38",
                unidad: "%"
            },
            {
                nombre: "Leucocitos",
                valor: "6,800",
                unidad: "/µL"
            },
            {
                nombre: "Plaquetas",
                valor: "235,000",
                unidad: "/µL"
            }
        ],

        observaciones:
            "Resultado registrado sin observaciones adicionales."
    }

};


function abrirResultado(tipo) {

    const resultado = resultadosExamenes[tipo];

    if (!resultado) {
        console.error("No se encontró el resultado.");
        return;
    }


    document.getElementById("modalTitulo").textContent =
        resultado.titulo;

    document.getElementById("modalPaciente").textContent =
        resultado.paciente;

    document.getElementById("modalInterno").textContent =
        "Interno " + resultado.interno;

    document.getElementById("modalAtencion").textContent =
        resultado.atencion;

    document.getElementById("modalFecha").textContent =
        resultado.fecha;

    document.getElementById("modalObservaciones").textContent =
        resultado.observaciones;


    const container =
        document.getElementById("resultadoCampos");

    container.innerHTML = "";


    resultado.resultados.forEach(campo => {

        const div = document.createElement("div");

        div.classList.add("result-item");

        div.innerHTML = `
            <span>${campo.nombre}</span>

            <strong>
                ${campo.valor}
                ${campo.unidad
                    ? `<small>${campo.unidad}</small>`
                    : ""
                }
            </strong>
        `;

        container.appendChild(div);

    });


    document.getElementById("resultadoModal")
        .classList.add("show");
}


function cerrarResultado() {

    document.getElementById("resultadoModal")
        .classList.remove("show");

}


document.getElementById("resultadoModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {
            cerrarResultado();
        }

    });


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        cerrarResultado();
    }

});


function filtrarHistorial() {

    const paciente =
        document.getElementById("buscarInterno").value;

    const tipo =
        document.getElementById("tipoExamen").value;

    const desde =
        document.getElementById("fechaDesde").value;

    const hasta =
        document.getElementById("fechaHasta").value;


    console.log({
        paciente,
        tipo,
        desde,
        hasta
    });

    alert("Los filtros se conectarán posteriormente con el backend.");

}

