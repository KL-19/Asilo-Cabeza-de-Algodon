using ApiAsilo.Data;
using ApiAsilo.Models;
using ApiAsilo.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultadosLaboratorioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AtencionMedicaService _atencionMedicaService;

        public ResultadosLaboratorioController(
            AppDbContext context,
            AtencionMedicaService atencionMedicaService)
        {
            _context = context;
            _atencionMedicaService = atencionMedicaService;
        }

        [HttpGet("en-proceso")]
        public async Task<ActionResult> GetExamenesEnProceso()
        {
            var examenes = await _context.ExamenesLaboratorio
                .Where(e => e.Estado == "En proceso")
                .Include(e => e.AtencionMedica)
                    .ThenInclude(a => a!.Cita)
                        .ThenInclude(c => c!.Interno)
                .Include(e => e.AtencionMedica)
                    .ThenInclude(a => a!.Cita)
                        .ThenInclude(c => c!.Especialista)
                .OrderBy(e => e.FechaSolicitud)
                .Select(e => new
                {
                    id = e.ID,
                    tipoExamen = e.TipoExamen,
                    indicaciones = e.Indicaciones,
                    fechaSolicitud = e.FechaSolicitud,
                    fechaTomaMuestra = e.FechaTomaMuestra,
                    costo = e.Costo,
                    estado = e.Estado,
                    atencionId = e.AtencionMedicaID,
                    internoId = e.AtencionMedica!.Cita!.InternoID,
                    internoNombre = e.AtencionMedica.Cita.Interno!.Nombre + " " + e.AtencionMedica.Cita.Interno.Apellido,
                    medicoSolicitante = e.AtencionMedica.Cita.Especialista!.NombreCompleto
                })
                .ToListAsync();
            return Ok(examenes);
        }

        [HttpGet("examen/{examenId}")]
        public async Task<ActionResult> GetResultadoPorExamen(int examenId)
        {
            var examen = await _context.ExamenesLaboratorio
                .Include(e => e.AtencionMedica)
                    .ThenInclude(a => a!.Cita)
                        .ThenInclude(c => c!.Interno)
                .FirstOrDefaultAsync(e => e.ID == examenId);
            if (examen == null)
            {
                return NotFound(new
                {
                    mensaje = "El examen de laboratorio no fue encontrado."
                });
            }
            var resultado = await _context.ResultadosLaboratorio
                .FirstOrDefaultAsync(r => r.ExamenLaboratorioID == examenId);
            return Ok(new
            {
                existe = resultado != null,
                examen = new
                {
                    id = examen.ID,
                    atencionMedicaID = examen.AtencionMedicaID,
                    tipoExamen = examen.TipoExamen,
                    indicaciones = examen.Indicaciones,
                    fechaSolicitud = examen.FechaSolicitud,
                    fechaTomaMuestra = examen.FechaTomaMuestra,
                    costo = examen.Costo,
                    estado = examen.Estado,
                    internoId = examen.AtencionMedica!.Cita!.InternoID,
                    internoNombre =
                        examen.AtencionMedica.Cita.Interno!.Nombre + " " + examen.AtencionMedica.Cita.Interno.Apellido
                },
                resultado = resultado == null
                    ? null
                    : new
                    {
                        id = resultado.ID,
                        fechaResultado = resultado.FechaResultado,
                        resultado = resultado.Resultado,
                        observaciones = resultado.Observaciones
                    }
            });
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetResultadosPorAtencion(int atencionId)
        {
            var resultados = await _context.ResultadosLaboratorio.AsNoTracking()
                .Where(r =>
                r.ExamenLaboratorio != null && r.ExamenLaboratorio.AtencionMedicaID == atencionId
                )
                .Select(r => new
                {
                    id = r.ID,
                    examenLaboratorioID = r.ExamenLaboratorioID,
                    fechaResultado = r.FechaResultado,
                    resultado = r.Resultado,
                    observaciones = r.Observaciones,
                    examenLaboratorio = new
                    {
                        id = r.ExamenLaboratorio!.ID,
                        tipoExamen = r.ExamenLaboratorio.TipoExamen,
                        indicaciones = r.ExamenLaboratorio.Indicaciones,
                        fechaSolicitud = r.ExamenLaboratorio.FechaSolicitud,
                        fechaTomaMuestra = r.ExamenLaboratorio.FechaTomaMuestra,
                        costo = r.ExamenLaboratorio.Costo,
                        estado = r.ExamenLaboratorio.Estado
                    }
                })
                .ToListAsync();
            return Ok(resultados);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetResultado(int id)
        {
            var resultado = await _context.ResultadosLaboratorio
                .Include(r => r.ExamenLaboratorio)
                .FirstOrDefaultAsync(r => r.ID == id);
            if (resultado == null)
            {
                return NotFound(new
                {
                    mensaje = "El resultado de laboratorio no fue encontrado."
                });
            }
            return Ok(resultado);
        }

        [HttpPost]
        public async Task<ActionResult> PostResultado(
            ResultadoLaboratorio resultado)
        {
            var examen = await _context.ExamenesLaboratorio
                .FirstOrDefaultAsync(e => e.ID == resultado.ExamenLaboratorioID);
            if (examen == null)
            {
                return BadRequest(new
                {
                    mensaje = "El examen de laboratorio indicado no existe."
                });
            }

            if (examen.Estado != "En proceso")
            {
                return BadRequest(new
                {
                    mensaje = "El examen no se encuentra en proceso y no puede registrar un resultado."
                });
            }

            var resultadoExistente =
                await _context.ResultadosLaboratorio
                    .FirstOrDefaultAsync( r => r.ExamenLaboratorioID == resultado.ExamenLaboratorioID);
            if (resultadoExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "Este examen ya tiene un resultado registrado.",
                    resultadoId = resultadoExistente.ID
                });
            }
            if (string.IsNullOrWhiteSpace(resultado.Resultado))
            {
                return BadRequest(new
                {
                    mensaje = "Debe ingresar el resultado del examen."
                    });
                }
                resultado.FechaResultado = DateTime.Now;
                resultado.ExamenLaboratorio = null;
                 _context.ResultadosLaboratorio.Add(resultado);
                examen.Estado = "Completado";
                await _context.SaveChangesAsync();

                await _atencionMedicaService.VerificarEstadoAtencion(examen.AtencionMedicaID);
                return Ok(new
                {
                mensaje = "El resultado de laboratorio fue registrado correctamente.",
                resultado = new
                {
                    id = resultado.ID,
                    examenLaboratorioID = resultado.ExamenLaboratorioID,
                    fechaResultado = resultado.FechaResultado,
                    resultado = resultado.Resultado,
                    observaciones = resultado.Observaciones,
                    registradoPorUsuarioID = resultado.RegistradoPorUsuarioID
                },
                examen = new
                {
                    id = examen.ID,
                    estado = examen.Estado
                },
                atencion = new
                {
                    id = examen.AtencionMedicaID
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutResultado(
            int id,
            ResultadoLaboratorio resultado)
        {
            var resultadoExistente = await _context.ResultadosLaboratorio.FirstOrDefaultAsync(r => r.ID == id);
            if (resultadoExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El resultado de laboratorio no fue encontrado."
                });
            }

            if (string.IsNullOrWhiteSpace(resultado.Resultado))
            {
                return BadRequest(new
                {
                    mensaje = "Debe ingresar el resultado."
                });
            }
            resultadoExistente.Resultado = resultado.Resultado;
            resultadoExistente.Observaciones = resultado.Observaciones;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El resultado fue actualizado correctamente.",
                resultado = resultadoExistente
            });
        }
    }
}