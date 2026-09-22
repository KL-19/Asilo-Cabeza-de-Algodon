using Microsoft.AspNetCore.Mvc;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonacionesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonacionesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarDonacion([FromBody] Donacion donacion)
        {
            _context.Donaciones.Add(donacion);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Donación registrada correctamente",
                id = donacion.Id
            });
        }
    }
}