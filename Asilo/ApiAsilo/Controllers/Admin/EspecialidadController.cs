using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EspecialidadesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EspecialidadesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerEspecialidades()
        {
            var especialidades = await _context.Especialidades
                .Where(e => e.Activo)
                .OrderBy(e => e.Nombre)
                .Select(e => new
                {
                    id = e.Id,
                    nombre = e.Nombre
                })
                .ToListAsync();

            return Ok(especialidades);
        }
    }
}