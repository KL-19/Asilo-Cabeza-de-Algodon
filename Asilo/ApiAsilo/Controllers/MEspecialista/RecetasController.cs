using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecetasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public RecetasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetRecetasPorAtencion(int atencionId)
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
                .Include(r => r.AtencionMedica)
                .FirstOrDefaultAsync(r => r.ID == id);
            if (receta == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }
            return Ok(receta);
        }

        [HttpPost]
        public async Task<ActionResult> PostReceta(Receta receta)
        {
            var atencion = await _context.AtencionesMedicas
                .FirstOrDefaultAsync(a => a.ID == receta.AtencionMedicaID);
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

            return CreatedAtAction(
                nameof(GetReceta),
                new { id = receta.ID },
                new
                {
                    id = receta.ID,
                    atencionMedicaID = receta.AtencionMedicaID,
                    fechaReceta = receta.FechaReceta,
                    indicacionesGenerales = receta.IndicacionesGenerales,
                    estado = receta.Estado
                }
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutReceta(
            int id,
            Receta receta)
        {
            var recetaExistente = await _context.Recetas
                .FirstOrDefaultAsync(r => r.ID == id);
            if (recetaExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }
            
            recetaExistente.IndicacionesGenerales = receta.IndicacionesGenerales;
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