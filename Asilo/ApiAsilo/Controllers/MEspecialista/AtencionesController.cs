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
        public async Task<ActionResult<AtencionMedica>> GetAtencionPorCita(int citaId)
        {
            var cita = await _context.Citas
                .Include(c => c.Interno)
                .Include(c => c.Solicitud)
                .FirstOrDefaultAsync(c => c.Id == citaId);
            if (cita == null)
            {
                return NotFound(new
                {
                    mensaje = "La cita no fue encontrada."
                });
            }

            var atencion = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.CitaID == citaId);
            if (atencion == null)
            {
                return Ok(new
                {
                    existe = false,
                    cita = cita
                });
            }
            return Ok(new
            {
                existe = true,
                atencion = atencion,
                cita = cita
            });
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
        public async Task<ActionResult<AtencionMedica>> PostAtencion(AtencionMedica atencion)
        {
            var cita = await _context.Citas.FirstOrDefaultAsync(c => c.Id == atencion.CitaID);
            if (cita == null)
            {
                return BadRequest(new
                {
                    mensaje = "La cita indicada no existe."
                });
            }

            var atencionExistente = await _context.AtencionesMedicas.FirstOrDefaultAsync(a => a.CitaID == atencion.CitaID);
            if (atencionExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "Esta cita ya tiene una atención médica registrada.", atencionId = atencionExistente.ID
                });
            }
            atencion.FechaAtencion = DateTime.Now;
            atencion.Estado = "En proceso";
            atencion.Cita = null;
            _context.AtencionesMedicas.Add(atencion);
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
            if (id != atencion.ID)
            {
                return BadRequest(new
                {
                    mensaje = "El ID de la atención no coincide."
                });
            }

            var atencionExistente = await _context.AtencionesMedicas
                .FirstOrDefaultAsync(a => a.ID == id);
            if (atencionExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }
            atencionExistente.Diagnostico = atencion.Diagnostico;
            atencionExistente.DiagnosticoFinal = atencion.DiagnosticoFinal;
            atencionExistente.Observaciones = atencion.Observaciones;
            atencionExistente.CostoConsulta = atencion.CostoConsulta;
            atencionExistente.Estado = atencion.Estado;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "La atención médica fue actualizada correctamente.",
                atencion = atencionExistente
            });
        }
    }
}