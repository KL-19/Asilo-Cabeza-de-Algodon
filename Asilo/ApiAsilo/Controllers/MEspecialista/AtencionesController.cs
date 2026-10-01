using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AtencionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AtencionesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("cita/{citaId}")]
        public async Task<ActionResult> GetAtencionPorCita(int citaId)
        {
            var cita = await _context.Citas
                .AsNoTracking()
                .Where(c => c.Id == citaId)
                .Select(c => new
            {

                id = c.Id,
                fechaHora = c.FechaHora,
                motivo = c.Motivo,
                estado = c.Estado,
                interno = c.Interno == null
                        ? null
                        : new
                    {
                        id = c.Interno.Id,
                        nombre = c.Interno.Nombre,
                        apellido = c.Interno.Apellido,
                        dpi = c.Interno.DPI
                    },
                    especialista = c.Especialista == null
                        ? null
                        : new
                    {
                        id = c.Especialista.Id,
                        nombreUsuario = c.Especialista.NombreUsuario,
                        nombreCompleto = c.Especialista.NombreCompleto
                    },
                    solicitud = c.Solicitud == null
                        ? null
                        : new
                    {
                        id = c.Solicitud.Id,
                        motivo = c.Solicitud.Motivo,

                        especialidad = c.Solicitud.Especialidad == null
                            ? null
                            : new
                            {
                                id = c.Solicitud.Especialidad.Id,
                                nombre = c.Solicitud.Especialidad.Nombre
                            },
                        enfermero = c.Solicitud.Enfermero == null
                            ? null
                            : new
                            {
                                id = c.Solicitud.Enfermero.Id,
                                nombreCompleto =  c.Solicitud.Enfermero.NombreCompleto
                            }
                    }
            })
            .FirstOrDefaultAsync();
            if (cita == null)
            {
                return NotFound(new
                    {
                        mensaje = "La cita no fue encontrada."
                    });
            }

            var atencion = await _context.AtencionesMedicas
                .AsNoTracking()
                .Where(a => a.CitaID == citaId)
                .Select(a => new
            {
                id = a.ID,
                citaID = a.CitaID,
                fechaAtencion = a.FechaAtencion,
                diagnostico = a.Diagnostico,
                diagnosticoFinal = a.DiagnosticoFinal,
                observaciones = a.Observaciones,
                costoConsulta = a.CostoConsulta,
                estado = a.Estado
            })
            .FirstOrDefaultAsync();
            if (atencion == null)
            {
                return Ok(new
                {
                    existe = false,
                    cita = cita
                });
            }

            var examenes = await _context.ExamenesLaboratorio
                .AsNoTracking()
                .Where(e => e.AtencionMedicaID == atencion.id)
                .Select(e => new
                {
                    id = e.ID,
                    tipoExamen = e.TipoExamen,
                    indicaciones = e.Indicaciones,
                    fechaSolicitud = e.FechaSolicitud,
                    fechaTomaMuestra = e.FechaTomaMuestra,
                    costo = e.Costo,
                    estado = e.Estado
                })
                .ToListAsync();

            var recetas = await _context.Recetas
                .AsNoTracking()
                .Where(r => r.AtencionMedicaID == atencion.id)
                .Select(r => new
                {
                    id = r.ID,
                    fechaReceta = r.FechaReceta,
                    estado = r.Estado
                })
                .ToListAsync();

            var recetaIds = recetas
                .Select(r => r.id)
                .ToList();

            var detalles = await _context.DetalleReceta
                .AsNoTracking()
                .Where(d => recetaIds.Contains(d.RecetaID))
                .Select(d => new
                {
                    id = d.ID,
                    recetaID = d.RecetaID,
                    medicamento = d.Medicamento,
                    dosis = d.Dosis,
                    frecuencia = d.Frecuencia,
                    duracion = d.Duracion,
                    cantidad = d.Cantidad,
                    indicaciones = d.Indicaciones
                })
                .ToListAsync();

            var recetasConDetalle = recetas
                .Select(r => new
                {
                    r.id,
                    r.fechaReceta,
                    r.estado,
                    detalleReceta = detalles.Where(d => d.recetaID == r.id).ToList()
                })
                .ToList();
            return Ok(new   
            {
                existe = true,
                atencion = new
                {
                    atencion.id,
                    atencion.citaID,
                    atencion.fechaAtencion,
                    atencion.diagnostico,
                    atencion.diagnosticoFinal,
                    atencion.observaciones,
                    atencion.costoConsulta,
                    atencion.estado,
                    examenesLaboratorio = examenes,
                    recetas = recetasConDetalle
                },
                cita = cita
            });
        }

        [HttpGet("interno/{internoId}")]
        public async Task<ActionResult> GetHistorialPorInterno(int internoId)
        {
            var internoExiste = await _context.Internos.AnyAsync(i => i.Id == internoId);
            if (!internoExiste)
            {
                return NotFound(new
                {
                    mensaje = "El interno no fue encontrado."
                });
            }

            var atenciones = await _context.AtencionesMedicas
                .Include(a => a.Cita)
                    .ThenInclude(c => c!.Interno)
                .Where(a =>
                    a.Cita != null &&
                    a.Cita.InternoID == internoId)
                .OrderByDescending(a => a.FechaAtencion)
                .ToListAsync();
            return Ok(atenciones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AtencionMedica>> GetAtencion(int id)
        {
            var atencion = await _context.AtencionesMedicas
                .Include(a => a.Cita)
                    .ThenInclude(c => c!.Interno)
                .FirstOrDefaultAsync(a => a.ID == id);
            if (atencion == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }
            return Ok(atencion);
        }

        [HttpPost]
        public async Task<ActionResult<AtencionMedica>> PostAtencion(
            AtencionMedica atencion)
        {
            var cita = await _context.Citas.Include(c => c.Interno).FirstOrDefaultAsync(c => c.Id == atencion.CitaID);
            if (cita == null)
            {
                return BadRequest(new
                {
                    mensaje = "La cita indicada no existe."
                });
            }
            
            var atencionExistente =await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.CitaID == atencion.CitaID);
            if (atencionExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "Esta cita ya tiene una atención médica registrada.", atencionId = atencionExistente.ID
                });
            }
            if (cita.Interno == null)
            {
                return BadRequest(new
                {
                    mensaje = "El interno de la cita no fue encontrado."
                });
            }

            atencion.FechaAtencion = DateTime.Now;
            if (atencion.Estado != "Pendiente resultados")
            {
                atencion.Estado = "Completada";
            }
            atencion.Cita = null;
            _context.AtencionesMedicas.Add(atencion);
            await _context.SaveChangesAsync();
            if (atencion.CostoConsulta.HasValue &&
                atencion.CostoConsulta.Value > 0)
            {
                var cargo = new CargoCuenta
                {
                    FamiliarID = cita.Interno.FamiliarID,
                    InternoID = cita.Interno.Id,
                    AtencionMedicaID = atencion.ID,
                    Concepto = "Consulta médica",
                    MontoOriginal = atencion.CostoConsulta.Value,
                    PorcentajeDescuento = 10,
                    Monto = atencion.CostoConsulta.Value * 0.90m,
                    FechaCargo = DateTime.Now,
                    Estado = "Pendiente",
                    Observaciones = atencion.Observaciones
                };
                _context.CargosCuenta.Add(cargo);
                await _context.SaveChangesAsync();
            }
            if (atencion.Estado == "Completada")
            {
                cita.Estado = "Completada";
            }
            else
            {
                cita.Estado = "Pendiente";
            }
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetAtencion),
                new { id = atencion.ID },
                atencion
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAtencion(
            int id,
            AtencionMedica atencion)
        {
            var atencionExistente = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.ID == id);
            if (atencionExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }

            var cita = await _context.Citas
                .FirstOrDefaultAsync(
                    c => c.Id == atencionExistente.CitaID);
            if (cita == null)
            {
                return NotFound(new
                {
                    mensaje = "La cita asociada no fue encontrada."
                });
            }
            if (!string.IsNullOrWhiteSpace(atencion.DiagnosticoFinal))
            {
                atencionExistente.DiagnosticoFinal = atencion.DiagnosticoFinal;
                atencionExistente.Observaciones = atencion.Observaciones;
                atencionExistente.Estado = "Completada";
                cita.Estado = "Completada";
            }
            else
            {
                atencionExistente.Diagnostico = atencion.Diagnostico;
                atencionExistente.Observaciones = atencion.Observaciones;
                atencionExistente.CostoConsulta = atencion.CostoConsulta;
                if (!string.IsNullOrWhiteSpace(atencion.Estado))
                {
                    atencionExistente.Estado = atencion.Estado;
                }
                if (atencionExistente.Estado == "Pendiente resultados")
                {
                    cita.Estado = "Pendiente";
                }
                else if (atencionExistente.Estado == "Completada")
                {
                    cita.Estado = "Completada";
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "La atención médica fue actualizada correctamente.",atencion = atencionExistente
            });
        }
    }
}