using Microsoft.AspNetCore.Mvc;
using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<IActionResult> ObtenerDonaciones()
        {
            var donaciones = await _context.Donaciones.OrderByDescending(d => d.FechaRecepcion)
                .Select(d => new
                {
                    id = d.Id,
                    fechaRecepcion = d.FechaRecepcion,
                    nombreDonante = d.NombreDonante,
                    tipoDonante = d.TipoDonante,
                    formaRecepcion = d.FormaRecepcion,
                    monto = d.Monto,
                    numeroReferencia = d.NumeroReferencia
                })
                .ToListAsync();
            return Ok(donaciones);
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