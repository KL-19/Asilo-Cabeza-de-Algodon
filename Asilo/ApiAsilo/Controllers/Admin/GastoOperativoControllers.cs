using Microsoft.AspNetCore.Mvc;
using ApiAsilo.Data;
using ApiAsilo.Models;

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