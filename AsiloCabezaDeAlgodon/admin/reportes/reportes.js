// MODAL - COSTOS DE CITAS POR PACIENTE

const modalCostosCitas = document.getElementById("modalCostosCitas");
const cerrarModalCostos = document.getElementById("cerrarModalCostos");

// Obtener el primer botón "Generar reporte"
const botonesGenerarReporte = document.querySelectorAll(".report-button");

// ABRIR MODAL
botonesGenerarReporte[0].addEventListener("click", function () {
    modalCostosCitas.classList.add("active");
});

// CERRAR MODAL CON LA X
cerrarModalCostos.addEventListener("click", function () {
    modalCostosCitas.classList.remove("active");
});


// CERRAR MODAL HACIENDO CLIC FUERA
modalCostosCitas.addEventListener("click", function (event) {
    if (event.target === modalCostosCitas) {
        modalCostosCitas.classList.remove("active");
    }
});

// MODAL - ANÁLISIS MÉDICOS POR PACIENTE
const modalAnalisisMedicos = document.getElementById("modalAnalisisMedicos");
const cerrarModalAnalisis = document.getElementById("cerrarModalAnalisis");

botonesGenerarReporte[1].addEventListener("click", function () {
    modalAnalisisMedicos.classList.add("active");
});


cerrarModalAnalisis.addEventListener("click", function () {
    modalAnalisisMedicos.classList.remove("active");
});

modalAnalisisMedicos.addEventListener("click", function (event) {
    if (event.target === modalAnalisisMedicos) {
        modalAnalisisMedicos.classList.remove("active");
    }
});

// MODAL - COBROS POR PACIENTE
const modalCobrosPaciente = document.getElementById("modalCobrosPaciente");
const cerrarModalCobros = document.getElementById("cerrarModalCobros");

botonesGenerarReporte[2].addEventListener("click", function () {
    modalCobrosPaciente.classList.add("active");
});

cerrarModalCobros.addEventListener("click", function () {
    modalCobrosPaciente.classList.remove("active");
});

modalCobrosPaciente.addEventListener("click", function (event) {
    if (event.target === modalCobrosPaciente) {
        modalCobrosPaciente.classList.remove("active");
    }
});

// MODAL 4 - PAGOS A LA FUNDACIÓN
const modalPagosFundacion = document.getElementById("modalPagosFundacion");
const cerrarModalFundacion = document.getElementById("cerrarModalFundacion");

botonesGenerarReporte[3].addEventListener("click", function () {
    modalPagosFundacion.classList.add("active");
});

cerrarModalFundacion.addEventListener("click", function () {
    modalPagosFundacion.classList.remove("active");
});

modalPagosFundacion.addEventListener("click", function (event) {
    if (event.target === modalPagosFundacion) {
        modalPagosFundacion.classList.remove("active");
    }
});

// MODAL 5 - DONACIONES Y COBROS
const modalDonacionesCobros = document.getElementById("modalDonacionesCobros");
const cerrarModalDonaciones = document.getElementById("cerrarModalDonaciones");

botonesGenerarReporte[4].addEventListener("click", function () {
    modalDonacionesCobros.classList.add("active");
});

cerrarModalDonaciones.addEventListener("click", function () {
    modalDonacionesCobros.classList.remove("active");
});

modalDonacionesCobros.addEventListener("click", function (event) {
    if (event.target === modalDonacionesCobros) {
        modalDonacionesCobros.classList.remove("active");
    }
});

// MODAL 6 - EXÁMENES MÉDICOS POR PACIENTE
const modalExamenesPaciente = document.getElementById("modalExamenesPaciente");
const cerrarModalExamenes = document.getElementById("cerrarModalExamenes");

botonesGenerarReporte[5].addEventListener("click", function () {
    modalExamenesPaciente.classList.add("active");
});

cerrarModalExamenes.addEventListener("click", function () {
    modalExamenesPaciente.classList.remove("active");
});

modalExamenesPaciente.addEventListener("click", function (event) {
    if (event.target === modalExamenesPaciente) {
        modalExamenesPaciente.classList.remove("active");
    }
});

// MODAL 7 - MEDICAMENTOS APLICADOS POR PACIENTE
const modalMedicamentosPaciente = document.getElementById("modalMedicamentosPaciente");
const cerrarModalMedicamentos = document.getElementById("cerrarModalMedicamentos");

botonesGenerarReporte[6].addEventListener("click", function () {
    modalMedicamentosPaciente.classList.add("active");
});

cerrarModalMedicamentos.addEventListener("click", function () {
    modalMedicamentosPaciente.classList.remove("active");
});

modalMedicamentosPaciente.addEventListener("click", function (event) {
    if (event.target === modalMedicamentosPaciente) {
        modalMedicamentosPaciente.classList.remove("active");
    }
});