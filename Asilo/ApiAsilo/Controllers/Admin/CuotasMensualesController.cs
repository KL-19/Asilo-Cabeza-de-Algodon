using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuotasMensualesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CuotasMensualesController(AppDbContext context)
        {
            _context = context;
        }

        // OBTENER INTERNOS
        [HttpGet("internos")]
        public async Task<IActionResult> ObtenerInternos(
            [FromQuery] string? buscar)
        {
            var consulta = _context.Internos
                .Where(i => i.Activo)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(buscar))
            {
                consulta = consulta.Where(i =>
                    (i.Nombre + " " + i.Apellido)
                    .Contains(buscar));
            }

            var internos = await consulta
                .OrderBy(i => i.Nombre)
                .Select(i => new
                {
                    id = i.Id,
                    nombre = i.Nombre + " " + i.Apellido
                })
                .ToListAsync();

            return Ok(internos);
        }

        // REGISTRAR CUOTA
        [HttpPost]
        public async Task<IActionResult> RegistrarCuota(
            [FromBody] RegistroCuotaDTO datos)
        {
            var internoExiste = await _context.Internos
                .AnyAsync(i => i.Id == datos.InternoID && i.Activo);

            if (!internoExiste)
            {
                return BadRequest(new
                {
                    mensaje = "El interno seleccionado no existe."
                });
            }

            var partesPeriodo = datos.Periodo.Split('-');
            if (partesPeriodo.Length != 2)
            {
                return BadRequest(new
                {
                    mensaje = "El periodo seleccionado no es válido."
                });
            }

            int anio = int.Parse(partesPeriodo[0]);
            int mes = int.Parse(partesPeriodo[1]);

            // Verificar que no exista otra cuota
            // para el mismo interno y periodo.
            var cuotaExiste = await _context.CuotasMensuales
                .AnyAsync(c =>
                    c.InternoID == datos.InternoID &&
                    c.PeriodoAnio == anio &&
                    c.PeriodoMes == mes);

            if (cuotaExiste)
            {
                return BadRequest(new
                {
                    mensaje = "Ya existe una cuota registrada para este interno y periodo."
                });
            }

            var cuota = new CuotaMensual
            {
                InternoID = datos.InternoID,
                PeriodoAnio = anio,
                PeriodoMes = mes,
                Monto = datos.Monto,
                FechaPago = datos.FechaPago,
                MetodoPago = datos.MetodoPago,
                NumeroReferencia = datos.NumeroReferencia,
                Observaciones = datos.Observaciones,
                Estado = "Pagado"
            };

            _context.CuotasMensuales.Add(cuota);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Cuota registrada correctamente",
                id = cuota.Id
            });
        }
    }

    public class RegistroCuotaDTO
    {
        public int InternoID { get; set; }
        public string Periodo { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public DateTime? FechaPago { get; set; }
        public string? MetodoPago { get; set; }
        public string? NumeroReferencia { get; set; }
        public string? Observaciones { get; set; }
    }
}