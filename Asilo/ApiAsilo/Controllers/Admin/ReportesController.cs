using ApiAsilo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReportesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("CostosCitas")]
        public async Task<ActionResult> GetCostosCitas(int internoId, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var interno = await _context.Internos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == internoId);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El paciente no fue encontrado."
                });
            }

            var citasQuery = _context.Citas.AsNoTracking().Where(c => c.InternoID == internoId);
            if (fechaInicio.HasValue)
            {
                citasQuery = citasQuery.Where(c => c.FechaHora >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                citasQuery = citasQuery.Where(c => c.FechaHora < fechaFinExclusiva);
            }

            var citas = await citasQuery.OrderByDescending(c => c.FechaHora).ToListAsync();
            var citaIds = citas.Select(c => c.Id).ToList();
            var atenciones = await _context.AtencionesMedicas.AsNoTracking().Where(a => citaIds.Contains(a.CitaID)).ToListAsync();
            var atencionIds = atenciones.Select(a => a.ID).ToList();
            var examenes = await _context.ExamenesLaboratorio.AsNoTracking().Where(e => atencionIds.Contains(e.AtencionMedicaID)).ToListAsync();
            var recetas = await _context.Recetas.AsNoTracking().Where(r => atencionIds.Contains(r.AtencionMedicaID)).Include(r => r.Detalles).ToListAsync();
            var recetaIds = recetas.Select(r => r.ID).ToList();
            var entregas = await _context.EntregasFarmacia.AsNoTracking().Where(e => recetaIds.Contains(e.RecetaID)).ToListAsync();
            var cargos = await _context.CargosCuenta.AsNoTracking().Where(c => c.InternoID == internoId && c.AtencionMedicaID.HasValue && atencionIds.Contains(c.AtencionMedicaID.Value)).ToListAsync();

            var resultado = citas.SelectMany(cita =>atenciones.Where(a => a.CitaID == cita.Id).Select(atencion =>
                        {
                            var examenesAtencion = examenes.Where(e => e.AtencionMedicaID == atencion.ID).ToList();
                            var recetasAtencion = recetas.Where(r => r.AtencionMedicaID == atencion.ID).ToList();
                            var recetaIdsAtencion = recetasAtencion.Select(r => r.ID).ToList();
                            var entregasAtencion = entregas.Where(e => recetaIdsAtencion.Contains(e.RecetaID)).ToList();
                            var cargo = cargos.FirstOrDefault(c => c.AtencionMedicaID == atencion.ID);
                            var costoConsulta = atencion.CostoConsulta ?? 0;
                            var costoExamenes = examenesAtencion.Sum(e => e.Costo ?? 0);
                            var costoMedicamentos = entregasAtencion.Sum(e => e.CostoTotal ?? 0);
                            var montoOriginal = cargo?.MontoOriginal ??
                                (costoConsulta + costoExamenes + costoMedicamentos);
                            var montoFinal = cargo?.Monto ??
                                montoOriginal;

                            return new
                            {
                                citaId = cita.Id,
                                atencionId = atencion.ID,
                                fecha = cita.FechaHora,
                                paciente = $"{interno.Nombre} {interno.Apellido}",
                                motivo = cita.Motivo,
                                costoConsulta,
                                costoExamenes,
                                costoMedicamentos,
                                montoOriginal,
                                porcentajeDescuento = cargo?.PorcentajeDescuento ?? 0,
                                montoFinal,
                                estadoCargo = cargo?.Estado,
                                detallesExamenes = examenesAtencion.Select(e => new
                                {
                                    id = e.ID,
                                    tipoExamen = e.TipoExamen,
                                    fechaSolicitud = e.FechaSolicitud,
                                    costo = e.Costo,
                                    estado = e.Estado
                                }),
                                detallesMedicamentos = recetasAtencion
                                    .SelectMany(r => r.Detalles)
                                    .Select(d => new
                                    {
                                        medicamento = d.Medicamento,
                                        dosis = d.Dosis,
                                        frecuencia = d.Frecuencia,
                                        duracion = d.Duracion,
                                        cantidad = d.Cantidad,
                                        indicaciones = d.Indicaciones
                                    })
                            };
                        })
                )
                .ToList();
            return Ok(new
            {
                paciente = new
                {
                    id = interno.Id,
                    nombre = $"{interno.Nombre} {interno.Apellido}",
                    fechaNacimiento = interno.FechaNacimiento,
                    fechaIngreso = interno.FechaIngreso
                },
                fechaInicio,
                fechaFin,
                registros = resultado,
                totalCitas = resultado.Count,
                totalConsultas = resultado.Sum(r => r.costoConsulta),
                totalExamenes = resultado.Sum(r => r.costoExamenes),
                totalMedicamentos = resultado.Sum(r => r.costoMedicamentos),
                totalOriginal = resultado.Sum(r => r.montoOriginal),
                totalFinal = resultado.Sum(r => r.montoFinal)
            });
        }

        [HttpGet("AnalisisMedico")]
        public async Task<ActionResult> GetAnalisisMedico(int internoId)
        {
            var interno = await _context.Internos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == internoId);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El paciente no fue encontrado."
                });
            }

            var evaluaciones = await _context.EvaluacionesMedicas.AsNoTracking().Where(e => e.InternoID == internoId).OrderByDescending(e => e.FechaEvaluacion).Select(e => new
                {
                    id = e.Id,
                    fecha = e.FechaEvaluacion,
                    motivoConsulta = e.MotivoConsulta,
                    presionArterial = e.PresionArterial,
                    temperatura = e.Temperatura,
                    frecuenciaCardiaca = e.FrecuenciaCardiaca,
                    saturacionOxigeno = e.SaturacionOxigeno,
                    diagnostico = e.Diagnostico,
                    tratamiento = e.Tratamiento,
                    observaciones = e.Observaciones,
                    requiereEspecialista = e.RequiereEspecialista
                })
                .ToListAsync();

            var solicitudes = await _context.SolicitudesEspecialista.AsNoTracking().Where(s => s.InternoID == internoId).OrderByDescending(s => s.FechaSolicitud).Select(s => new
                {
                    id = s.Id,
                    fechaSolicitud = s.FechaSolicitud,
                    fechaAsignacion = s.FechaAsignacion,
                    motivo = s.Motivo,
                    observaciones = s.Observaciones,
                    estado = s.Estado,
                    especialidad = s.Especialidad != null
                        ? s.Especialidad.Nombre
                        : null
                })
                .ToListAsync();

            var citas = await _context.Citas.AsNoTracking().Where(c => c.InternoID == internoId).OrderByDescending(c => c.FechaHora).ToListAsync();
            var citaIds = citas.Select(c => c.Id).ToList();

            var atenciones = await _context.AtencionesMedicas.AsNoTracking().Where(a => citaIds.Contains(a.CitaID)).Select(a => new
                {
                    id = a.ID,
                    citaId = a.CitaID,
                    diagnostico = a.Diagnostico,
                    diagnosticoFinal = a.DiagnosticoFinal,
                    observaciones = a.Observaciones,
                    costoConsulta = a.CostoConsulta,
                    estado = a.Estado
                })
                .ToListAsync();
            var historialAtenciones = citas.Select(c => new
                {
                    id = c.Id,
                    fecha = c.FechaHora,
                    motivo = c.Motivo,
                    estado = c.Estado,
                    atenciones = atenciones
                        .Where(a => a.citaId == c.Id)
                        .Select(a => new
                        {
                            a.id,
                            a.diagnostico,
                            a.diagnosticoFinal,
                            a.observaciones,
                            a.costoConsulta,
                            a.estado
                        })
                        .ToList()
                })
                .ToList();

            var recetas = await _context.Recetas.AsNoTracking()
                .Where(r => r.AtencionMedica != null && r.AtencionMedica.Cita != null && r.AtencionMedica.Cita.InternoID == internoId)
                .Include(r => r.Detalles).OrderByDescending(r => r.FechaReceta)
                .Select(r => new
                {
                    id = r.ID,
                    fecha = r.FechaReceta,
                    estado = r.Estado,
                    medicamentos = r.Detalles.Select(d => new
                    {
                        medicamento = d.Medicamento,
                        dosis = d.Dosis,
                        frecuencia = d.Frecuencia,
                        duracion = d.Duracion,
                        cantidad = d.Cantidad,
                        indicaciones = d.Indicaciones
                    })
                })
                .ToListAsync();
            return Ok(new
            {
                paciente = new
                {
                    id = interno.Id,
                    nombre = $"{interno.Nombre} {interno.Apellido}",
                    fechaNacimiento = interno.FechaNacimiento,
                    genero = interno.Genero,
                    dpi = interno.DPI,
                    fechaIngreso = interno.FechaIngreso,
                    direccionAnterior = interno.DireccionAnterior,
                    telefonoEmergencia = interno.TelefonoEmergencia
                },
                evaluaciones,
                solicitudesEspecialista = solicitudes,
                historialAtenciones,
                recetas
            });
        }

        // 3. COBROS POR PACIENTE
        [HttpGet("CobrosPaciente")]
        public async Task<ActionResult> GetCobrosPaciente(int internoId, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var interno = await _context.Internos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == internoId);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El paciente no fue encontrado."
                });
            }

            var familiar = await _context.Familiares.AsNoTracking().FirstOrDefaultAsync(f => f.Id == interno.FamiliarID);
            var cargosQuery = _context.CargosCuenta.AsNoTracking().Where(c => c.InternoID == internoId);
            if (fechaInicio.HasValue)
            {
                cargosQuery = cargosQuery.Where(c => c.FechaCargo >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                cargosQuery = cargosQuery.Where(c => c.FechaCargo < fechaFinExclusiva);
            }

            var cargos = await cargosQuery.OrderByDescending(c => c.FechaCargo).Select(c => new
                {
                    id = c.ID,
                    fecha = c.FechaCargo,
                    concepto = c.Concepto,
                    tipo = "Servicio médico",
                    montoOriginal = c.MontoOriginal,
                    descuento = c.PorcentajeDescuento,
                    monto = c.Monto,
                    estado = c.Estado,
                    fechaPago = c.FechaPago
                })
                .ToListAsync();
            var cuotasQuery = _context.CuotasMensuales.AsNoTracking().Where(c => c.InternoID == internoId);

            if (fechaInicio.HasValue)
            {
                cuotasQuery = cuotasQuery.Where(c => c.FechaPago.HasValue && c.FechaPago.Value >= fechaInicio.Value.Date);
            }
            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                cuotasQuery = cuotasQuery.Where(c => c.FechaPago.HasValue && c.FechaPago.Value < fechaFinExclusiva);
            }

            var cuotas = await cuotasQuery.OrderByDescending(c => c.FechaPago).Select(c => new
                {
                    id = c.Id,
                    fecha = c.FechaPago,
                    concepto = $"Cuota mensual {c.PeriodoMes}/{c.PeriodoAnio}",
                    tipo = "Cuota mensual",
                    montoOriginal = c.Monto,
                    descuento = 0m,
                    monto = c.Monto,
                    estado = c.Estado,
                    fechaPago = c.FechaPago
                })
                .ToListAsync();
            var resultado = cargos
                .Select(c => new
                {
                    c.id,
                    c.fecha,
                    c.concepto,
                    c.tipo,
                    c.montoOriginal,
                    c.descuento,
                    c.monto,
                    c.estado,
                    c.fechaPago
                })
                .Concat(
                    cuotas.Select(c => new
                    {
                        c.id,
                        fecha = c.fecha ?? DateTime.MinValue,
                        c.concepto,
                        c.tipo,
                        c.montoOriginal,
                        c.descuento,
                        c.monto,
                        c.estado,
                        c.fechaPago
                    })
                )
                .OrderByDescending(c => c.fecha).ToList();
            return Ok(new
            {
                paciente = new
                {
                    id = interno.Id,
                    nombre = $"{interno.Nombre} {interno.Apellido}",
                    familiar = familiar?.NombreCompleto
                },
                fechaInicio,
                fechaFin,
                registros = resultado,
                total = resultado.Sum(r => r.monto)
            });
        }

        [HttpGet("PagosServiciosMedicos")]
        public async Task<ActionResult> GetPagosServiciosMedicos(DateTime? fechaInicio, DateTime? fechaFin)
        {
            var query = _context.CargosCuenta.AsNoTracking().Where(c => c.Estado == "Pagado" && c.FechaPago.HasValue);
            if (fechaInicio.HasValue)
            {
                query = query.Where(c => c.FechaPago >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                query = query.Where(c => c.FechaPago < fechaFinExclusiva);
            }

            var pagos = await query.OrderByDescending(c => c.FechaPago).Select(c => new
                {
                    id = c.ID,
                    fechaPago = c.FechaPago,
                    familiar = c.Familiar != null
                        ? c.Familiar.NombreCompleto
                        : "Sin familiar",
                    paciente = c.Interno != null
                        ? $"{c.Interno.Nombre} {c.Interno.Apellido}"
                        : "Sin paciente",
                    concepto = c.Concepto,
                    montoOriginal = c.MontoOriginal,
                    descuento = c.PorcentajeDescuento,
                    monto = c.Monto
                })
                .ToListAsync();
            return Ok(new
            {
                fechaInicio,
                fechaFin,
                pagos,
                totalPagos = pagos.Count,
                montoTotal = pagos.Sum(p => p.monto)
            });
        }

        [HttpGet("DonacionesYCobros")]
        public async Task<ActionResult> GetDonacionesYCobros(DateTime? fechaInicio, DateTime? fechaFin)
        {
            var donacionesQuery = _context.Donaciones.AsNoTracking();
            if (fechaInicio.HasValue)
            {
                donacionesQuery = donacionesQuery.Where(d => d.FechaRecepcion >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                donacionesQuery = donacionesQuery.Where(d => d.FechaRecepcion < fechaFinExclusiva);
            }

            var donaciones = await donacionesQuery.Select(d => new
                {
                    fecha = d.FechaRecepcion,
                    tipo = "Donación",
                    descripcion = d.Observaciones ?? "Donación recibida",
                    responsable = d.NombreDonante,
                    monto = d.Monto
                })
                .ToListAsync();
            var cargosQuery = _context.CargosCuenta.AsNoTracking().Where(c => c.Estado == "Pagado" && c.FechaPago.HasValue);
            if (fechaInicio.HasValue)
            {
                cargosQuery = cargosQuery.Where(c => c.FechaPago >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                cargosQuery = cargosQuery.Where(c => c.FechaPago < fechaFinExclusiva);
            }

            var cargos = await cargosQuery
                .Select(c => new
                {
                    fecha = c.FechaPago!.Value,
                    tipo = "Cobro",
                    descripcion = c.Concepto,
                    responsable = c.Familiar != null
                        ? c.Familiar.NombreCompleto
                        : "Sin familiar",
                    monto = c.Monto
                })
                .ToListAsync();
            var cuotasQuery = _context.CuotasMensuales.AsNoTracking().Where(c => c.Estado == "Pagado" && c.FechaPago.HasValue);
            if (fechaInicio.HasValue)
            {
                cuotasQuery = cuotasQuery.Where(c => c.FechaPago >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                cuotasQuery = cuotasQuery.Where(c => c.FechaPago < fechaFinExclusiva);
            }

            var cuotas = await cuotasQuery.Select(c => new
                {
                    fecha = c.FechaPago!.Value,
                    tipo = "Cobro",
                    descripcion = $"Cuota mensual {c.PeriodoMes}/{c.PeriodoAnio}",
                    responsable = c.Interno != null && c.Interno.Familiar != null
                        ? c.Interno.Familiar.NombreCompleto
                        : "Sin familiar",
                    monto = c.Monto
                })
                .ToListAsync();
            var entradas = donaciones.Concat(cargos).Concat(cuotas).OrderByDescending(e => e.fecha).ToList();
            return Ok(new
            {
                fechaInicio,
                fechaFin,
                donaciones = donaciones.Sum(d => d.monto),
                cobros = cargos.Sum(c => c.monto) + cuotas.Sum(c => c.monto),
                totalEntradas = entradas.Sum(e => e.monto),
                registros = entradas
            });
        }

        [HttpGet("ExamenesPaciente")]
        public async Task<ActionResult> GetExamenesPaciente(int internoId, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var interno = await _context.Internos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == internoId);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El paciente no fue encontrado."
                });
            }

            var query = _context.ExamenesLaboratorio.AsNoTracking().Where(e => e.AtencionMedica != null && e.AtencionMedica.Cita != null && e.AtencionMedica.Cita.InternoID == internoId);
            if (fechaInicio.HasValue)
            {
                query = query.Where(e => e.FechaSolicitud >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                query = query.Where(e => e.FechaSolicitud < fechaFinExclusiva);
            }

            var examenes = await query.OrderByDescending(e => e.FechaSolicitud).Select(e => new
                {
                    id = e.ID,
                    fechaSolicitud = e.FechaSolicitud,
                    fechaTomaMuestra = e.FechaTomaMuestra,
                    tipoExamen = e.TipoExamen,
                    indicaciones = e.Indicaciones,
                    costo = e.Costo,
                    estado = e.Estado,
                    resultado = e.Resultado != null
                        ? e.Resultado.Resultado
                        : null,
                    observacionesResultado = e.Resultado != null
                        ? e.Resultado.Observaciones
                        : null,
                    fechaResultado = e.Resultado != null
                        ? (DateTime?)e.Resultado.FechaResultado
                        : null
                })
                .ToListAsync();
            return Ok(new
            {
                paciente = new
                {
                    id = interno.Id,
                    nombre = $"{interno.Nombre} {interno.Apellido}",
                    fechaNacimiento = interno.FechaNacimiento,
                    fechaIngreso = interno.FechaIngreso
                },
                fechaInicio,
                fechaFin,
                examenes,
                totalExamenes = examenes.Count,
                completados = examenes.Count(e => e.estado == "Completado"),
                pendientes = examenes.Count(e => e.estado != "Completado")
            });
        }

        [HttpGet("MedicamentosPaciente")]
        public async Task<ActionResult> GetMedicamentosPaciente(int internoId, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var interno = await _context.Internos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == internoId);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El paciente no fue encontrado."
                });
            }

            var query = _context.Recetas.AsNoTracking().Where(r => r.AtencionMedica != null && r.AtencionMedica.Cita != null && r.AtencionMedica.Cita.InternoID == internoId);
            if (fechaInicio.HasValue)
            {
                query = query.Where(r => r.FechaReceta >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
                var fechaFinExclusiva = fechaFin.Value.Date.AddDays(1);
                query = query.Where(r => r.FechaReceta < fechaFinExclusiva);
            }

            var recetas = await query.OrderByDescending(r => r.FechaReceta).Select(r => new
                {
                    recetaId = r.ID,
                    fechaReceta = r.FechaReceta,
                    estadoReceta = r.Estado,
                    medicamentos = r.Detalles.Select(d => new
                    {
                        id = d.ID,
                        medicamento = d.Medicamento,
                        dosis = d.Dosis,
                        frecuencia = d.Frecuencia,
                        duracion = d.Duracion,
                        cantidad = d.Cantidad,
                        indicaciones = d.Indicaciones
                    })
                })
                .ToListAsync();
            var recetaIds = recetas.Select(r => r.recetaId).ToList();
            var entregas = await _context.EntregasFarmacia.AsNoTracking().Where(e => recetaIds.Contains(e.RecetaID)).Select(e => new
                {
                    recetaId = e.RecetaID,
                    fechaEntrega = e.FechaEntrega,
                    estado = e.Estado,
                    costoTotal = e.CostoTotal,
                    observaciones = e.Observaciones
                })
                .ToListAsync();
            var resultado = recetas.SelectMany(r =>
                    r.medicamentos.Select(m =>
                    {
                        var entrega = entregas.FirstOrDefault(e => e.recetaId == r.recetaId);
                        DateTime? fechaEntrega = entrega == null
                            ? null
                            : entrega.fechaEntrega;
                        return new
                        {
                            recetaId = r.recetaId,
                            fechaReceta = r.fechaReceta,
                            medicamento = m.medicamento,
                            dosis = m.dosis,
                            frecuencia = m.frecuencia,
                            duracion = m.duracion,
                            cantidad = m.cantidad,
                            indicaciones = m.indicaciones,
                            estadoReceta = r.estadoReceta,
                            fechaEntrega,
                            estadoEntrega = entrega?.estado,
                            costoEntrega = entrega?.costoTotal,
                            observacionesEntrega = entrega?.observaciones
                        };
                    })
                )
                .ToList();
            return Ok(new
            {
                paciente = new
                {
                    id = interno.Id,
                    nombre = $"{interno.Nombre} {interno.Apellido}",
                    fechaNacimiento = interno.FechaNacimiento,
                    fechaIngreso = interno.FechaIngreso
                },
                fechaInicio,
                fechaFin,
                medicamentos = resultado,
                totalMedicamentos = resultado.Count,
                medicamentosDiferentes = resultado
                    .Select(m => m.medicamento)
                    .Distinct()
                    .Count()
            });
        }
    }
}