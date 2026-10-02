using ApiAsilo.Data;
using ApiAsilo.Models;
using ApiAsilo.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntregasFarmaciaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AtencionMedicaService _atencionMedicaService;

        public EntregasFarmaciaController(
            AppDbContext context,
            AtencionMedicaService atencionMedicaService)
        {
            _context = context;
            _atencionMedicaService = atencionMedicaService;
        }

        [HttpGet("receta/{recetaId}")]
        public async Task<ActionResult> GetEntregaPorReceta(int recetaId)
        {
            var receta = await _context.Recetas.FirstOrDefaultAsync(r => r.ID == recetaId);
            if (receta == null)
            {
                return NotFound(new
                {
                    mensaje = "La receta no fue encontrada."
                });
            }

            var entrega = await _context.EntregasFarmacia.FirstOrDefaultAsync(e => e.RecetaID == recetaId);
            if (entrega == null)
            {
                return Ok(new
                {
                    existe = false, 
                    receta = receta
                });
            }
            return Ok(new
            {
                existe = true,
                entrega = entrega,
                receta = receta
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetEntrega(int id)
        {
            var entrega = await _context.EntregasFarmacia.Include(e => e.Receta).FirstOrDefaultAsync(e => e.ID == id);
            if (entrega == null)
            {
                return NotFound(new
                {
                    mensaje = "La entrega de farmacia no fue encontrada."
                });
            }
            return Ok(entrega);
        }

        [HttpPost]
        public async Task<ActionResult> PostEntrega(
            EntregaFarmacia entrega)
        {
            var receta = await _context.Recetas.FirstOrDefaultAsync(r => r.ID == entrega.RecetaID);
            if (receta == null)
            {
                return BadRequest(new
                {
                    mensaje = "La receta indicada no existe."
                });
            }

            var entregaExistente = await _context.EntregasFarmacia.FirstOrDefaultAsync(e => e.RecetaID == entrega.RecetaID);
            if (entregaExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "Esta receta ya tiene una entrega registrada.",entregaId = entregaExistente.ID
                });
            }
            entrega.FechaEntrega = DateTime.Now;
            entrega.Estado = "Completado";
            entrega.Receta = null;
            _context.EntregasFarmacia.Add(entrega);
            receta.Estado = "Entregada";
            await _context.SaveChangesAsync();
            await _atencionMedicaService.VerificarEstadoAtencion(receta.AtencionMedicaID);
            
            return CreatedAtAction(
                nameof(GetEntrega),
                new { id = entrega.ID },
                new
                {
                    id = entrega.ID,
                    recetaID = entrega.RecetaID,
                    fechaEntrega = entrega.FechaEntrega,
                    entregadoPorUsuarioID = entrega.EntregadoPorUsuarioID,
                    estado = entrega.Estado,
                    costoTotal = entrega.CostoTotal,
                    observaciones = entrega.Observaciones
                }
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEntrega(
            int id,
            EntregaFarmacia entrega)
        {
            var entregaExistente = await _context.EntregasFarmacia.FirstOrDefaultAsync(e => e.ID == id);
            if (entregaExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La entrega de farmacia no fue encontrada."
                });
            }

            entregaExistente.CostoTotal = entrega.CostoTotal;
            entregaExistente.Observaciones = entrega.Observaciones;
            if (!string.IsNullOrWhiteSpace(entrega.Estado))
            {
                entregaExistente.Estado = entrega.Estado;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "La entrega fue actualizada correctamente.",entrega = entregaExistente
            });
        }
    }
}