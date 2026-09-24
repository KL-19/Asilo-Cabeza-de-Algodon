using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FamiliaresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FamiliaresController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // OBTENER TODOS LOS FAMILIARES
        // ============================================================

        [HttpGet]
        public async Task<IActionResult> ObtenerFamiliares()
        {
            var familiares = await _context.Familiares
                .Include(f => f.Internos)
                .OrderBy(f => f.NombreCompleto)
                .Select(f => new
                {
                    id = f.Id,
                    nombreCompleto = f.NombreCompleto,
                    parentesco = f.Parentesco,
                    telefono = f.Telefono,
                    correo = f.Correo,
                    direccion = f.Direccion,
                    activo = f.Activo,

                    internos = f.Internos
                        .OrderBy(i => i.Nombre)
                        .Select(i => new
                        {
                            id = i.Id,
                            nombreCompleto = i.Nombre + " " + i.Apellido,
                            activo = i.Activo
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(familiares);
        }

        // ============================================================
        // OBTENER UN FAMILIAR POR ID
        // ============================================================

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerFamiliar(int id)
        {
            var familiar = await _context.Familiares
                .Include(f => f.Internos)
                .Where(f => f.Id == id)
                .Select(f => new
                {
                    id = f.Id,
                    nombreCompleto = f.NombreCompleto,
                    parentesco = f.Parentesco,
                    telefono = f.Telefono,
                    correo = f.Correo,
                    direccion = f.Direccion,
                    activo = f.Activo,

                    internos = f.Internos
                        .OrderBy(i => i.Nombre)
                        .Select(i => new
                        {
                            id = i.Id,
                            nombreCompleto =
                                i.Nombre + " " + i.Apellido,
                            activo = i.Activo
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (familiar == null)
            {
                return NotFound(new
                {
                    mensaje = "El familiar no existe."
                });
            }

            return Ok(familiar);
        }

        // ============================================================
        // EDITAR FAMILIAR
        // ============================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> EditarFamiliar(
            int id,
            [FromBody] EditarFamiliarDTO datos)
        {
            var familiar = await _context.Familiares
                .FirstOrDefaultAsync(f => f.Id == id);

            if (familiar == null)
            {
                return NotFound(new
                {
                    mensaje = "El familiar no existe."
                });
            }

            familiar.NombreCompleto = datos.NombreCompleto;
            familiar.Parentesco = datos.Parentesco;
            familiar.Telefono = datos.Telefono;
            familiar.Correo = datos.Correo;
            familiar.Direccion = datos.Direccion;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Familiar actualizado correctamente."
            });
        }

        // ============================================================
        // ACTUALIZAR ESTADO DEL FAMILIAR
        // ============================================================

        [HttpPut("{id}/actualizar-estado")]
        public async Task<IActionResult> ActualizarEstadoFamiliar(int id)
        {
            var familiar = await _context.Familiares
                .Include(f => f.Internos)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (familiar == null)
            {
                return NotFound(new
                {
                    mensaje = "El familiar no existe."
                });
            }

            // Si tiene al menos un interno activo,
            // el familiar permanece activo.
            bool tieneInternoActivo =
                familiar.Internos.Any(i => i.Activo);

            familiar.Activo = tieneInternoActivo;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = familiar.Activo
                    ? "El familiar continúa activo."
                    : "El familiar ha sido dado de baja porque no tiene internos activos.",
                activo = familiar.Activo
            });
        }
    }

    // ============================================================
    // DTO EDITAR FAMILIAR
    // ============================================================

    public class EditarFamiliarDTO
    {
        public string NombreCompleto { get; set; }
            = string.Empty;

        public string? Parentesco { get; set; }

        public string? Telefono { get; set; }

        public string? Correo { get; set; }

        public string? Direccion { get; set; }
    }
}