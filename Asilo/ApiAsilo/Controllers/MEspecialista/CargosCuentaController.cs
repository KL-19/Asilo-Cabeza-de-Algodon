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

        [HttpGet]
        public async Task<ActionResult> GetCargos()
        {
            var cargos = await _context.CargosCuenta
                .OrderByDescending(c => c.FechaCargo)
                .Select(c => new
                {
                    id = c.ID,
                    familiarId = c.FamiliarID,
                    familiar = c.Familiar != null
                        ? c.Familiar.NombreCompleto
                        : "Sin familiar",
                    internoId = c.InternoID,
                    atencionMedicaId = c.AtencionMedicaID,
                    concepto = c.Concepto,
                    montoOriginal = c.MontoOriginal,
                    porcentajeDescuento = c.PorcentajeDescuento,
                    monto = c.Monto,
                    fechaCargo = c.FechaCargo,
                    estado = c.Estado
                })
                .ToListAsync();
            return Ok(cargos);
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

            cargo.Familiar = null;
            cargo.Interno = null;
            cargo.AtencionMedica = null;
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
            [FromBody] EstadoCargoRequest solicitud)
        {
            var cargoExistente = await _context.CargosCuenta.FirstOrDefaultAsync(c => c.ID == id);
            if (cargoExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El cargo no fue encontrado."
                });
            }

            if (solicitud == null || string.IsNullOrWhiteSpace(solicitud.Estado))
            {
                return BadRequest(new
                {
                    mensaje = "Debe indicar el estado del cargo."
                });
            }

            if (solicitud.Estado != "Pendiente" && solicitud.Estado != "Pagado")
            {
                return BadRequest(new
                {
                    mensaje = "El estado debe ser Pendiente o Pagado."
                });
            }

            cargoExistente.Estado = solicitud.Estado;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = solicitud.Estado == "Pagado"
                    ? "El pago fue registrado correctamente." 
                    : "El estado del cargo fue actualizado correctamente.", 
                cargo = cargoExistente
            });
        }
    }

    public class EstadoCargoRequest
    {
        public string Estado { get; set; } = string.Empty;
    }
}