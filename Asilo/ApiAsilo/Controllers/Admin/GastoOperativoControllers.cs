using Microsoft.AspNetCore.Mvc;
using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GastosOperativosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GastosOperativosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerGastos()
        {
            var gastos = await _context.GastosOperativos
                .OrderByDescending(g => g.FechaGasto)
                .Select(g => new
                {
                    id = g.Id,
                    fechaGasto = g.FechaGasto,
                    tipoGasto = g.TipoGasto,
                    descripcion = g.Descripcion,
                    proveedorBeneficiario = g.ProveedorBeneficiario,
                    monto = g.Monto,
                    metodoPago = g.MetodoPago,
                    numeroReferencia = g.NumeroReferencia
                })
                .ToListAsync();
            return Ok(gastos);
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarGasto(
            [FromBody] GastoOperativo gasto)
        {
            _context.GastosOperativos.Add(gasto);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Gasto registrado correctamente",
                id = gasto.Id
            });
        }
    }
}