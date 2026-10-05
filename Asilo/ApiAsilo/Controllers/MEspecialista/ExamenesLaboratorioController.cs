using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Services;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamenesLaboratorioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AtencionMedicaService _atencionMedicaService;
        public ExamenesLaboratorioController(AppDbContext context, AtencionMedicaService atencionMedicaService)
        {
            _context = context;
            _atencionMedicaService = atencionMedicaService;
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetExamenesPorAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }

            var examenes = await _context.ExamenesLaboratorio
                .Where(e => e.AtencionMedicaID == atencionId)
                .OrderBy(e => e.ID)
                .Select(e => new
                {
                    id = e.ID,
                    atencionMedicaID = e.AtencionMedicaID,
                    tipoExamen = e.TipoExamen,
                    indicaciones = e.Indicaciones,
                    fechaSolicitud = e.FechaSolicitud,
                    fechaTomaMuestra = e.FechaTomaMuestra,
                    costo = e.Costo,
                    estado = e.Estado
                })
                .ToListAsync();
            return Ok(examenes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetExamen(int id)
        {
            var examen = await _context.ExamenesLaboratorio
                .FirstOrDefaultAsync(e => e.ID == id);
            if (examen == null)
            {
                return NotFound(new
                {
                    mensaje = "El examen de laboratorio no fue encontrado."
                });
            }
            return Ok(examen);
        }

        [HttpPost]
        public async Task<ActionResult> PostExamen(ExamenLaboratorio examen)
        {
            var atencion = await _context.AtencionesMedicas
                .FirstOrDefaultAsync(a => a.ID == examen.AtencionMedicaID);
            if (atencion == null)
            {
                return BadRequest(new
                {
                    mensaje = "La atención médica indicada no existe."
                });
            }
            if (string.IsNullOrWhiteSpace(examen.TipoExamen))
            {
                return BadRequest(new
                {
                    mensaje = "Debe indicar el tipo de examen."
                });
            }
            examen.FechaSolicitud = DateTime.Now;
            examen.Estado = "Pendiente";
            examen.AtencionMedica = null;
            _context.ExamenesLaboratorio.Add(examen);
            await _context.SaveChangesAsync();
            await _atencionMedicaService.VerificarEstadoAtencion(examen.AtencionMedicaID);
            
            return CreatedAtAction(
                nameof(GetExamen),
                new { id = examen.ID },
                new
                {
                    id = examen.ID,
                    atencionMedicaID = examen.AtencionMedicaID,
                    tipoExamen = examen.TipoExamen,
                    indicaciones = examen.Indicaciones,
                    fechaSolicitud = examen.FechaSolicitud,
                    fechaTomaMuestra = examen.FechaTomaMuestra,
                    costo = examen.Costo,
                    estado = examen.Estado
                }
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutExamen(
            int id,
            ExamenLaboratorio examen)
        {
            var examenExistente = await _context.ExamenesLaboratorio
                .FirstOrDefaultAsync(e => e.ID == id);
            if (examenExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El examen de laboratorio no fue encontrado."
                });
            }
            examenExistente.TipoExamen = examen.TipoExamen;
            examenExistente.Indicaciones = examen.Indicaciones;
            examenExistente.FechaTomaMuestra = examen.FechaTomaMuestra;
            examenExistente.Costo = examen.Costo;

            if (!string.IsNullOrWhiteSpace(examen.Estado))
            {
                examenExistente.Estado = examen.Estado;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El examen fue actualizado correctamente.", examen = examenExistente
            });
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult> GetSolicitudesPendientes()
        {
        var examenes = await _context.ExamenesLaboratorio
            .Include(e => e.AtencionMedica)
                .ThenInclude(a => a!.Cita)
                    .ThenInclude(c => c!.Interno)
            .Include(e => e.AtencionMedica)
                .ThenInclude(a => a!.Cita)
                    .ThenInclude(c => c!.Especialista)
            .Where(e => e.Estado == "Pendiente")
            .OrderBy(e => e.FechaSolicitud)
            .ToListAsync();

            var solicitudes = examenes
                .GroupBy(e => e.AtencionMedicaID)
                .Select(grupo =>
                {
                    var primerExamen = grupo.First();
                    var atencion = primerExamen.AtencionMedica;
                    var cita = atencion?.Cita;
                    var interno = cita?.Interno;
                    var especialista = cita?.Especialista;
                    return new
                    {
                        atencionId = grupo.Key,
                        internoId = interno?.Id,
                        internoNombre = interno != null
                            ? $"{interno.Nombre} {interno.Apellido}"
                            : "Sin nombre",
                        medicoSolicitante = especialista != null
                            ? especialista.NombreCompleto
                            : "No registrado",
                        fechaAtencion = cita?.FechaHora,
                        examenes = grupo.Select(e => new
                        {
                            id = e.ID,
                            tipoExamen = e.TipoExamen,
                            indicaciones = e.Indicaciones,
                            costo = e.Costo,
                            fechaSolicitud = e.FechaSolicitud,
                            fechaTomaMuestra = e.FechaTomaMuestra,
                            estado = e.Estado
                        }).ToList()
                    };
                })
                .ToList();
            return Ok(solicitudes);
        }

        [HttpPut("procesar/{atencionId}")]
        public async Task<ActionResult> ProcesarSolicitud(
            int atencionId,
            [FromBody] ProcesarExamenesRequest solicitud)
            {
            var atencion = await _context.AtencionesMedicas
                .Include(a => a.ExamenesLaboratorio)
                .FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }
            if (solicitud == null || solicitud.Examenes == null || solicitud.Examenes.Count == 0)
            {
                return BadRequest(new
                {
                    mensaje = "No se recibieron exámenes para procesar."
                });
            }

            var examenesPendientes = atencion.ExamenesLaboratorio
                .Where(e => e.Estado == "Pendiente").ToList();
            if (examenesPendientes.Count == 0)
            {
                return BadRequest(new
                {
                    mensaje = "No existen exámenes pendientes para esta atención."
                });
            }

            foreach (var examen in examenesPendientes)
            {
                var dato = solicitud.Examenes.FirstOrDefault(x => x.Id == examen.ID);
                if (dato == null)
                {
                    return BadRequest(new
                    {
                        mensaje = $"No se recibió el costo del examen {examen.TipoExamen}."
                    });
                }

                if (dato.Costo <= 0)
                {
                    return BadRequest(new
                    {
                        mensaje = $"El costo del examen {examen.TipoExamen} debe ser mayor que cero."
                    });
                }
                examen.Costo = dato.Costo;
                examen.FechaTomaMuestra = DateTime.Now;
                examen.Estado = "En proceso";
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "La solicitud fue procesada correctamente.",
                atencionId = atencionId,
                examenes = examenesPendientes.Select(e => new
                {
                    id = e.ID,
                    tipoExamen = e.TipoExamen,
                    costo = e.Costo,
                    fechaTomaMuestra = e.FechaTomaMuestra,
                    estado = e.Estado
                })
            });
        }
    }
}

public class ProcesarExamenesRequest
{
    public List<ExamenProcesarRequest> Examenes { get; set; } = new();
}

public class ExamenProcesarRequest
{
    public int Id { get; set; }
    public decimal Costo { get; set; }
}