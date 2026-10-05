using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CargosCuentaController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CargosCuentaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("familiar/{familiarId}")]
        public async Task<ActionResult> GetCargosPorFamiliar(int familiarId)
        {
            var familiar = await _context.Familiares.FirstOrDefaultAsync(f => f.Id == familiarId);
            if (familiar == null)
            {
                return NotFound(new
                {
                    mensaje = "El familiar no fue encontrado."
                });
            }

            var cargos = await _context.CargosCuenta.Where(c => c.FamiliarID == familiarId).OrderByDescending(c => c.FechaCargo).ToListAsync();
            return Ok(cargos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetCargo(int id)
        {
            var cargo = await _context.CargosCuenta.FirstOrDefaultAsync(c => c.ID == id);
            if (cargo == null)
            {
                return NotFound(new
                {
                    mensaje = "El cargo no fue encontrado."
                });
            }
            return Ok(cargo);
        }

        [HttpPost]
        public async Task<ActionResult> PostCargo(CargoCuenta cargo)
        {
            var familiar = await _context.Familiares.FirstOrDefaultAsync(f => f.Id == cargo.FamiliarID);
            if (familiar == null)
            {
                return BadRequest(new
                {
                    mensaje = "El familiar indicado no existe."
                });
            }

            if (cargo.MontoOriginal <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "El monto original debe ser mayor que cero."
                });
            }

            if (cargo.PorcentajeDescuento < 0 || cargo.PorcentajeDescuento > 100)
            {
                return BadRequest(new
                {
                    mensaje = "El porcentaje de descuento debe estar entre 0 y 100."
                });
            }

            if (string.IsNullOrWhiteSpace(cargo.Concepto))
            {
                return BadRequest(new
                {
                    mensaje = "Debe indicar el concepto del cargo."
                });
            }

            cargo.FechaCargo = DateTime.Now;
            cargo.Estado = "Pendiente";

            // Evitar conflictos con las relaciones
            cargo.Familiar = null;
            cargo.Interno = null;
            cargo.CuotaMensual = null;
            cargo.AtencionMedica = null;
            cargo.ExamenLaboratorio = null;
            cargo.EntregaFarmacia = null;
            
            _context.CargosCuenta.Add(cargo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetCargo),
                new { id = cargo.ID },
                cargo
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCargo(
            int id,
            CargoCuenta cargo)
        {
            var cargoExistente = await _context.CargosCuenta.FirstOrDefaultAsync(c => c.ID == id);
            if (cargoExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El cargo no fue encontrado."
                });
            }

            cargoExistente.Observaciones = cargo.Observaciones;
            if (!string.IsNullOrWhiteSpace(cargo.Estado))
            {
                cargoExistente.Estado = cargo.Estado;
            }
            if (cargo.FechaVencimiento.HasValue)
            {
                cargoExistente.FechaVencimiento = cargo.FechaVencimiento;
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El cargo fue actualizado correctamente.", cargo = cargoExistente
            });
        }
    }
}