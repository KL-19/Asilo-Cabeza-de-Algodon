const API = "https://app-cabeza-algodon-f9ewg3ghcadhb6a6.mexicocentral-01.azurewebsites.net/api";
const REGISTROS_POR_PAGINA = 10;
let donaciones = [];
let cuotas = [];
let gastos = [];
let cargos = [];
let paginaDonaciones = 1;
let paginaCuotas = 1;
let paginaGastos = 1;
let paginaCargos = 1;

async function cargarFinanzas() {
    await cargarDonaciones();
    await cargarCuotas();
    await cargarGastos();
    await cargarCargos();
    actualizarResumenFinanciero();
}

function actualizarResumenFinanciero() {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    // INGRESOS
    const totalDonaciones = donaciones
        .filter(donacion => {
            if (!donacion.fechaRecepcion) {
                return false;
            }
            const fecha = new Date(donacion.fechaRecepcion);
            return (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual);
        })
        .reduce((total, donacion) => total + Number(donacion.monto || 0), 0);

    const totalCuotas = cuotas
        .filter(cuota => {
            if (!cuota.fechaPago) {
                return false;
            }

            const fecha = new Date(cuota.fechaPago);
            return ( fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual && cuota.estado === "Pagado");
        })
        .reduce((total, cuota) => total + Number(cuota.monto || 0), 0);

    const ingresos = totalDonaciones + totalCuotas;

    // EGRESOS
    const egresos = gastos
        .filter(gasto => {
            if (!gasto.fechaGasto) {
                return false;
            }
            const fecha = gasto.fechaGasto.substring(0, 10);
            const partes = fecha.split("-");
            const anio = parseInt(partes[0]);
            const mes = parseInt(partes[1]) - 1;
            return (mes === mesActual && anio === anioActual);
        })
        .reduce((total, gasto) => total + Number(gasto.monto || 0), 0);

    // BALANCE
    const ingresosTotales = donaciones
        .reduce((total, donacion) => total + Number(donacion.monto || 0), 0)
        +
        cuotas
            .filter(cuota => cuota.estado === "Pagado").reduce((total, cuota) => total + Number(cuota.monto || 0), 0);

    const gastosTotales = gastos.reduce((total, gasto) => total + Number(gasto.monto || 0), 0);
    const balance = ingresosTotales - gastosTotales;

    // MOSTRAR RESULTADOS
    document.getElementById("totalIngresos").textContent = `Q ${formatearMonto(ingresos)}`;
    document.getElementById("totalGastos").textContent = `Q ${formatearMonto(egresos)}`;
    document.getElementById("balanceActual").textContent = `Q ${formatearMonto(balance)}`;
}

async function cargarDonaciones() {
    try {
        const response = await fetch(`${API}/Donaciones`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar las donaciones.");
        }

        donaciones = await response.json();
        paginaDonaciones = 1;
        mostrarDonaciones();
    } catch (error) {
        console.error("Error al cargar donaciones:", error);

        document.getElementById(
            "tablaDonaciones"
        ).innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar las donaciones.
                </td>
            </tr>
        `;
    }
}

function mostrarDonaciones() {
    const tbody = document.getElementById("tablaDonaciones");
    const buscar = document.getElementById("buscarDonacion").value.trim().toLowerCase();

    const filtradas = donaciones.filter(donacion => {
        const texto = `
            ${donacion.nombreDonante || ""}
            ${donacion.tipoDonante || ""}
            ${donacion.formaRecepcion || ""}
            ${donacion.numeroReferencia || ""}
            ${donacion.monto || ""}
        `.toLowerCase();
        return texto.includes(buscar);
    });

    const totalRegistros = filtradas.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalRegistros / REGISTROS_POR_PAGINA
        )
    );

    if (paginaDonaciones > totalPaginas) {
        paginaDonaciones = totalPaginas;
    }

    const inicio = (paginaDonaciones - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    const registros = filtradas.slice(inicio, fin);
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">
                    <div class="empty-state">
                        <i class="ph ph-hand-heart"></i>
                        <strong>
                            No hay donaciones para mostrar
                        </strong>
                        <span>
                            Las donaciones registradas aparecerán aquí.
                        </span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        registros.forEach(donacion => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>
                    ${formatearFecha(
                        donacion.fechaRecepcion
                    )}
                </td>
                <td>
                    ${donacion.nombreDonante || "Sin nombre"}
                </td>
                <td>
                    ${donacion.tipoDonante || "Sin tipo"}
                </td>
                <td>
                    ${donacion.formaRecepcion || "Sin especificar"}
                </td>
                <td>
                    Q ${formatearMonto(donacion.monto)}
                </td>
                <td>
                    ${donacion.numeroReferencia || "Sin referencia"}
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    actualizarInfo("infoDonaciones", inicio, registros.length, totalRegistros, "donaciones");
    mostrarPaginacion("paginacionDonaciones", paginaDonaciones, totalPaginas,
        pagina => {
            paginaDonaciones = pagina;
            mostrarDonaciones();
        }
    );
}

async function cargarCuotas() {
    try {
        const response = await fetch(`${API}/CuotasMensuales`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar las cuotas.");
        }

        cuotas = await response.json();
        paginaCuotas = 1;
        mostrarCuotas();
    } catch (error) {
        console.error("Error al cargar cuotas:", error);

        document.getElementById("tablaCuotas"
        ).innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar las cuotas.
                </td>
            </tr>
        `;
    }
}

function mostrarCuotas() {
    const tbody = document.getElementById("tablaCuotas");
    const buscar = document.getElementById("buscarCuota").value.trim().toLowerCase();

    const filtradas = cuotas.filter(cuota => {
        const periodo =
            `${cuota.periodoAnio}-${String(
                cuota.periodoMes
            ).padStart(2, "0")}`;

        const texto = `
            ${cuota.interno || ""}
            ${periodo}
            ${cuota.metodoPago || ""}
            ${cuota.numeroReferencia || ""}
            ${cuota.estado || ""}
            ${cuota.monto || ""}
        `.toLowerCase();
        return texto.includes(buscar);
    });

    const totalRegistros = filtradas.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalRegistros / REGISTROS_POR_PAGINA
        )
    );
    if (paginaCuotas > totalPaginas) {
        paginaCuotas = totalPaginas;
    }

    const inicio = (paginaCuotas - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    const registros = filtradas.slice(inicio, fin);
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <div class="empty-state">
                        <i class="ph ph-calendar-check"></i>
                        <strong>
                            No hay cuotas para mostrar
                        </strong>
                        <span>
                            Los pagos registrados aparecerán aquí.
                        </span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        registros.forEach(cuota => {
            const periodo = `${cuota.periodoAnio}-${String(cuota.periodoMes).padStart(2, "0")}`;
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>
                    ${formatearFecha(
                        cuota.fechaPago
                    )}
                </td>
                <td>
                    ${cuota.interno || "Sin interno"}
                </td>
                <td>
                    ${periodo}
                </td>
                <td>
                    Q ${formatearMonto(cuota.monto)}
                </td>
                <td>
                    ${cuota.metodoPago || "Sin especificar"}
                </td>
                <td>
                    ${cuota.numeroReferencia || "Sin referencia"}
                </td>
                <td>
                    ${cuota.estado || "Sin estado"}
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    actualizarInfo("infoCuotas", inicio, registros.length, totalRegistros, "cuotas");
    mostrarPaginacion("paginacionCuotas",paginaCuotas, totalPaginas,
        pagina => {
            paginaCuotas = pagina;
            mostrarCuotas();
        }
    );
}

async function cargarGastos() {
    try {
        const response = await fetch(`${API}/GastosOperativos`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar los gastos.");
        }

        gastos = await response.json();
        paginaGastos = 1;
        mostrarGastos();
    } catch (error) {
        console.error("Error al cargar gastos:", error);

        document.getElementById(
            "tablaGastos"
        ).innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los gastos.
                </td>
            </tr>
        `;
    }
}

function mostrarGastos() {
    const tbody = document.getElementById("tablaGastos");
    const buscar = document.getElementById("buscarGasto").value.trim().toLowerCase();

    const filtrados = gastos.filter(gasto => {
        const texto = `
            ${gasto.tipoGasto || ""}
            ${gasto.descripcion || ""}
            ${gasto.proveedorBeneficiario || ""}
            ${gasto.metodoPago || ""}
            ${gasto.numeroReferencia || ""}
            ${gasto.monto || ""}
        `.toLowerCase();
        return texto.includes(buscar);
    });

    const totalRegistros = filtrados.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalRegistros / REGISTROS_POR_PAGINA
        )
    );

    if (paginaGastos > totalPaginas) {
        paginaGastos = totalPaginas;
    }

    const inicio = (paginaGastos - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    const registros = filtrados.slice(inicio, fin);
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <div class="empty-state">
                        <i class="ph ph-receipt"></i>
                        <strong>
                            No hay gastos para mostrar
                        </strong>
                        <span>
                            Los gastos registrados aparecerán aquí.
                        </span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        registros.forEach(gasto => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>
                    ${formatearFecha(
                        gasto.fechaGasto
                    )}
                </td>
                <td>
                    ${gasto.tipoGasto || "Sin tipo"}
                </td>
                <td>
                    ${gasto.descripcion || "Sin descripción"}
                </td>
                <td>
                    ${gasto.proveedorBeneficiario || "Sin especificar"}
                </td>
                <td>
                    Q ${formatearMonto(gasto.monto)}
                </td>
                <td>
                    ${gasto.metodoPago || "Sin especificar"}
                </td>
                <td>
                    ${gasto.numeroReferencia || "Sin referencia"}
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    actualizarInfo("infoGastos", inicio, registros.length, totalRegistros, "gastos");
    mostrarPaginacion("paginacionGastos", paginaGastos, totalPaginas,
        pagina => {
            paginaGastos = pagina;
            mostrarGastos();
        }
    );
}

// PAGOS DE SERVICIOS MÉDICOS
async function cargarCargos() {
    try {
        const response = await fetch(`${API}/CargosCuenta`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar los pagos de servicios médicos.");
        }

        cargos = await response.json();
        paginaCargos = 1;
        mostrarCargos();
    } catch (error) {
        console.error("Error al cargar pagos de servicios médicos:", error);

        document.getElementById(
            "tablaCargos"
        ).innerHTML = `
            <tr>
                <td colspan="8">
                    Error al cargar los pagos de servicios médicos.
                </td>
            </tr>
        `;
    }
}

function mostrarCargos() {
    const tbody = document.getElementById("tablaCargos");
    const buscar = document.getElementById("buscarCargo").value.trim().toLowerCase();
    const filtrados = cargos.filter(cargo => {
        const texto = `
            ${cargo.familiar || ""}
            ${cargo.concepto || ""}
            ${cargo.montoOriginal || ""}
            ${cargo.porcentajeDescuento || ""}
            ${cargo.monto || ""}
            ${cargo.estado || ""}
        `.toLowerCase();
        return texto.includes(buscar);
    });

    const totalRegistros = filtrados.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalRegistros / REGISTROS_POR_PAGINA
        )
    );

    if (paginaCargos > totalPaginas) {
        paginaCargos = totalPaginas;
    }
    const inicio = (paginaCargos - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    const registros = filtrados.slice(inicio, fin);
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">
                    <div class="empty-state">
                        <i class="ph ph-first-aid-kit"></i>
                        <strong>
                            No hay pagos de servicios médicos
                        </strong>
                        <span>
                            Los cargos de servicios médicos aparecerán aquí.
                        </span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        registros.forEach(cargo => {
            const fila = document.createElement("tr");
            const estado = cargo.estado || "Pendiente";
            const accion = estado === "Pendiente"
                    ? `
                        <button
                            type="button"
                            class="btn-pay"
                            onclick="pagarCargo(${cargo.id})">
                            <i class="ph ph-check"></i>
                            Pagar
                        </button>
                    `
                    : `
                        <span class="payment-completed">
                            Pagado
                        </span>
                    `;
            fila.innerHTML = `
                <td>
                    ${formatearFecha(
                        cargo.fechaCargo
                    )}
                </td>
                <td>
                    ${cargo.familiar || "Sin familiar"}
                </td>
                <td>
                    ${cargo.concepto || "Sin concepto"}
                </td>
                <td>
                    Q ${formatearMonto(
                        cargo.montoOriginal
                    )}
                </td>
                <td>
                    ${formatearMonto(
                        cargo.porcentajeDescuento
                    )}%
                </td>
                <td>
                    Q ${formatearMonto(
                        cargo.monto
                    )}
                </td>
                <td>
                    ${estado}
                </td>
                <td>
                    ${accion}
                </td>
            `;
            tbody.appendChild(fila);
        });
    }
    actualizarInfo("infoCargos", inicio, registros.length, totalRegistros, "pagos");
    mostrarPaginacion("paginacionCargos", paginaCargos, totalPaginas,
        pagina => {
            paginaCargos = pagina;
            mostrarCargos();
        }
    );
}

// REGISTRAR PAGO
async function pagarCargo(cargoId) {
    const confirmar = confirm("¿Desea registrar este servicio médico como pagado?");
    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/CargosCuenta/${cargoId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    estado: "Pagado"
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.mensaje || "No se pudo registrar el pago.");
        }
        alert("El pago fue registrado correctamente.");
        await cargarCargos();
    } catch (error) {
        console.error("Error al registrar pago:", error);
        alert(error.message || "Ocurrió un error al registrar el pago.");
    }
}

function mostrarPaginacion(
    contenedorId,
    paginaActual,
    totalPaginas,
    cambiarPagina
) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";

    const botonAnterior = document.createElement("button");
    botonAnterior.type = "button";
    botonAnterior.className = "pagination-btn";
    botonAnterior.innerHTML = `<i class="ph ph-caret-left"></i>`;
    botonAnterior.disabled = paginaActual === 1;
    botonAnterior.addEventListener(
        "click",
        function () {
            if (paginaActual > 1) {
                cambiarPagina(paginaActual - 1);
            }
        }
    );
    contenedor.appendChild(botonAnterior);

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "pagination-btn";
        boton.textContent = pagina;
        if (pagina === paginaActual) {
            boton.classList.add("active");
        }

        boton.addEventListener(
            "click",
            function () {
                cambiarPagina(pagina);
            }
        );
        contenedor.appendChild(boton);
    }

    const botonSiguiente = document.createElement("button");
    botonSiguiente.type = "button";
    botonSiguiente.className = "pagination-btn";
    botonSiguiente.innerHTML = `<i class="ph ph-caret-right"></i>`;
    botonSiguiente.disabled = paginaActual === totalPaginas;
    botonSiguiente.addEventListener(
        "click",
        function () {
            if (
                paginaActual < totalPaginas
            ) {
                cambiarPagina(paginaActual + 1);
            }
        }
    );
    contenedor.appendChild(botonSiguiente);
}

function actualizarInfo(
    elementoId,
    inicio,
    cantidadMostrada,
    totalRegistros,
    nombre
) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) {
        return;
    }

    if (totalRegistros === 0) {
        elemento.textContent = `Mostrando 0 de 0 ${nombre}`;
        return;
    }

    const desde = inicio + 1;
    const hasta = inicio + cantidadMostrada;
    elemento.textContent = `Mostrando ${desde}-${hasta} de ${totalRegistros} ${nombre}`;
}

document.getElementById("buscarDonacion").addEventListener(
        "input",
        function () {
            paginaDonaciones = 1;
            mostrarDonaciones();
        }
);  

document.getElementById("buscarCuota").addEventListener(
        "input",
        function () {
            paginaCuotas = 1;
            mostrarCuotas();
        }
    );

document.getElementById("buscarGasto").addEventListener(
        "input",
        function () {
            paginaGastos = 1;
            mostrarGastos();
        }
    );

document.getElementById("buscarCargo").addEventListener(
        "input",
        function () {
            paginaCargos = 1;
            mostrarCargos();
        }
    );

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaLocal = new Date(fecha);
    if (isNaN(fechaLocal)) {
        return "Sin fecha";
    }
    return fechaLocal.toLocaleDateString(
        "es-GT"
    );
}

function formatearMonto(monto) {
    return Number(
        monto || 0
    ).toLocaleString(
        "es-GT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function toggleFinanceSection(sectionId) {
    const contenido = document.getElementById(sectionId);
    const arrow = document.getElementById(`arrow-${sectionId}`);
    const estaAbierto = contenido.classList.contains("open");
    document.querySelectorAll(".finance-accordion-content")
        .forEach(seccion => {
            seccion.classList.remove("open");
        });
    document.querySelectorAll(".accordion-arrow")
        .forEach(icono => {
            icono.classList.remove("rotate");
        });

    if (!estaAbierto) {
        contenido.classList.add("open");
        arrow.classList.add("rotate");
    }
}

document.addEventListener( "DOMContentLoaded",
    function () {
        cargarFinanzas();
    }
);

setInterval(cargarFinanzas, 5000);