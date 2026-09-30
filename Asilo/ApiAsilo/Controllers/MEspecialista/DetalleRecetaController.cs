using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DetalleRecetaController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DetalleRecetaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("receta/{recetaId}")]
        public async Task<ActionResult> GetDetallesPorReceta(int recetaId)
        {
            var receta = await _context.Recetas.FirstOrDefaultAsync(r => r.ID == recetaId);
            if (receta == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }

            var detalles = await _context.DetalleReceta
                .Where(d => d.RecetaID == recetaId)
                .OrderBy(d => d.ID)
                .ToListAsync();
            return Ok(detalles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetDetalle(int id)
        {
            var detalle = await _context.DetalleReceta.FirstOrDefaultAsync(d => d.ID == id);
            if (detalle == null)
            {
                return NotFound(new
                {
                    mensaje = "El medicamento de la receta no fue encontrado."
                });
            }
            return Ok(detalle);
        }

        [HttpPost]
        public async Task<ActionResult> PostDetalle(
            DetalleReceta detalle)
        {
            var receta = await _context.Recetas.FirstOrDefaultAsync(r => r.ID == detalle.RecetaID);
            if (receta == null)
            {
                return BadRequest(new
                {
                    mensaje = "La receta indicada no existe."
                });
            }

            if (string.IsNullOrWhiteSpace(detalle.Medicamento))
            {
                return BadRequest(new
                {
                    mensaje = "Debe indicar el medicamento."
                });
            }
            detalle.Receta = null;
            _context.DetalleReceta.Add(detalle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDetalle),
                new { id = detalle.ID },
                detalle
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDetalle(
            int id,
            DetalleReceta detalle)
        {
            var detalleExistente = await _context.DetalleReceta.FirstOrDefaultAsync(d => d.ID == id);
            if (detalleExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El medicamento de la receta no fue encontrado."
                });
            }

            detalleExistente.Medicamento = detalle.Medicamento;
            detalleExistente.Dosis = detalle.Dosis;
            detalleExistente.Frecuencia = detalle.Frecuencia;
            detalleExistente.Duracion = detalle.Duracion;
            detalleExistente.Cantidad = detalle.Cantidad;
            detalleExistente.Indicaciones = detalle.Indicaciones;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El medicamento fue actualizado correctamente.",detalle = detalleExistente
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDetalle(int id)
        {
            var detalle = await _context.DetalleReceta.FirstOrDefaultAsync(d => d.ID == id);
            if (detalle == null)
            {
                return NotFound(new
                {
                    mensaje = "El medicamento no fue encontrado."
                });
            }

            _context.DetalleReceta.Remove(detalle);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El medicamento fue eliminado de la receta."
            });
        }
    }
}