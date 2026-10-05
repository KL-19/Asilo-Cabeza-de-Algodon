using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Services;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecetasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AtencionMedicaService _atencionMedicaService;
        public RecetasController(AppDbContext context, AtencionMedicaService atencionMedicaService)
        {
            _context = context;
            _atencionMedicaService = atencionMedicaService;
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult> GetRecetasPendientes()
        {
            var recetas = await _context.Recetas
                .AsNoTracking()
                .Where(r => r.Estado == "Pendiente")
                .Include(r => r.Detalles)
                .Include(r => r.AtencionMedica)
                    .ThenInclude(a => a.Cita)
                        .ThenInclude(c => c.Interno)
                .Include(r => r.AtencionMedica)
                    .ThenInclude(a => a.Cita)
                        .ThenInclude(c => c.Especialista)
                .OrderByDescending(r => r.ID)
                .ToListAsync();

            var resultado = recetas.Select(r => new
            {
                id = r.ID,
                atencionMedicaID = r.AtencionMedicaID,
                fechaReceta = r.FechaReceta,
                estado = r.Estado,
                internoId = r.AtencionMedica?.Cita?.Interno?.Id,
                internoNombre = r.AtencionMedica?.Cita?.Interno == null
                    ? "Sin información"
                    : r.AtencionMedica.Cita.Interno.Nombre + " " + r.AtencionMedica.Cita.Interno.Apellido,
                medicoSolicitante = r.AtencionMedica?.Cita?.Especialista?.NombreCompleto
                    ?? "Sin información",
                detalles = r.Detalles.Select(d => new
                {
                    id = d.ID,
                    medicamento = d.Medicamento,
                    dosis = d.Dosis,
                    frecuencia = d.Frecuencia,
                    duracion = d.Duracion,
                    cantidad = d.Cantidad,
                    indicaciones = d.Indicaciones
                }).ToList()
            }).ToList();
            return Ok(resultado);
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetRecetasPorAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }

            var recetas = await _context.Recetas
                .Where(r => r.AtencionMedicaID == atencionId)
                .OrderByDescending(r => r.ID)
                .ToListAsync();
            return Ok(recetas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetReceta(int id)
        {
            var receta = await _context.Recetas
                .AsNoTracking()
                .Include(r => r.Detalles)
                .Include(r => r.AtencionMedica)
                    .ThenInclude(a => a.Cita)
                        .ThenInclude(c => c.Interno)
                .Include(r => r.AtencionMedica)
                    .ThenInclude(a => a.Cita)
                        .ThenInclude(c => c.Especialista)
                .FirstOrDefaultAsync(r => r.ID == id);
            if (receta == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }

            return Ok(new
            {
                id = receta.ID,
                atencionMedicaID = receta.AtencionMedicaID,
                fechaReceta = receta.FechaReceta,
                estado = receta.Estado,
                internoId = receta.AtencionMedica?.Cita?.Interno?.Id,
                internoNombre = receta.AtencionMedica?.Cita?.Interno == null
                    ? "Sin información"
                    : receta.AtencionMedica.Cita.Interno.Nombre + " " + receta.AtencionMedica.Cita.Interno.Apellido,
                medicoSolicitante = receta.AtencionMedica?.Cita?.Especialista?.NombreCompleto
                    ?? "Sin información",
                detalles = receta.Detalles.Select(d => new
                {
                    id = d.ID,
                    medicamento = d.Medicamento,
                    dosis = d.Dosis,
                    frecuencia = d.Frecuencia,
                    duracion = d.Duracion,
                    cantidad = d.Cantidad,
                    indicaciones = d.Indicaciones
                }).ToList()
            });
        }

        [HttpPost]
        public async Task<ActionResult> PostReceta(Receta receta)
        {
            var atencion = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.ID == receta.AtencionMedicaID);
            if (atencion == null)
            {
                return BadRequest(new
                {
                    mensaje = "La atención médica indicada no existe."
                });
            }
            receta.FechaReceta = DateTime.Now;
            receta.Estado = "Pendiente";
            receta.AtencionMedica = null;
            _context.Recetas.Add(receta);
            await _context.SaveChangesAsync();
            await _atencionMedicaService.VerificarEstadoAtencion(receta.AtencionMedicaID);

            return CreatedAtAction(
                nameof(GetReceta),
                new { id = receta.ID },
                new
                {
                    id = receta.ID,
                    atencionMedicaID = receta.AtencionMedicaID,
                    fechaReceta = receta.FechaReceta,
                    estado = receta.Estado
                }
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutReceta(
            int id,
            Receta receta)
        {
            var recetaExistente = await _context.Recetas.FirstOrDefaultAsync(r => r.ID == id);
            if (recetaExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }
            if (!string.IsNullOrWhiteSpace(receta.Estado))
            {
                recetaExistente.Estado = receta.Estado;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "La receta fue actualizada correctamente.", receta = recetaExistente
            });
        }
    }
}