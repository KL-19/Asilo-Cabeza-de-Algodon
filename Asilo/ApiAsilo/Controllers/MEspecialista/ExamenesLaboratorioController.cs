using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamenesLaboratorioController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ExamenesLaboratorioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetExamenesPorAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas
                .FirstOrDefaultAsync(a => a.ID == atencionId);
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
            return CreatedAtAction(
                nameof(GetExamen),
                new { id = examen.ID },
                examen
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
    }
}