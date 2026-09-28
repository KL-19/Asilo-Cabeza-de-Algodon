using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnfermerosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnfermerosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{enfermeroId}/asignaciones")]
        public async Task<IActionResult> ObtenerAsignaciones(int enfermeroId)
        {
            var enfermero = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u =>
                    u.Id == enfermeroId &&
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "Enfermero");

            if (enfermero == null)
            {
                return NotFound(new
                {
                    mensaje = "El enfermero no existe o está inactivo."
                });
            }


            var asignaciones = await _context.SolicitudesEspecialista
                .Where(s => s.EnfermeroID == enfermeroId)
                .Include(s => s.Interno)
                .Include(s => s.Especialidad)
                .Include(s => s.Especialista)
                .OrderByDescending(s => s.FechaSolicitud)
                .Select(s => new
                {
                    id = s.Id,

                    internoId = s.InternoID,

                    interno = s.Interno == null
                        ? null
                        : new
                        {
                            id = s.Interno.Id,
                            nombre = s.Interno.Nombre,
                            apellido = s.Interno.Apellido,
                            nombreCompleto =
                                s.Interno.Nombre + " " +
                                s.Interno.Apellido
                        },

                    especialidad = s.Especialidad == null
                        ? null
                        : s.Especialidad.Nombre,

                    especialista = s.Especialista == null
                        ? null
                        : s.Especialista.NombreCompleto,

                    fechaSolicitud = s.FechaSolicitud,

                    fechaAsignacion = s.FechaAsignacion,

                    estado = s.Estado
                })
                .ToListAsync();


            return Ok(asignaciones);
        }

        [HttpGet("{enfermeroId}/asignaciones/{id}")]
        public async Task<IActionResult> ObtenerDetalle(
            int enfermeroId,
            int id)
        {
            var asignacion = await _context.SolicitudesEspecialista
                .Where(s =>
                    s.Id == id &&
                    s.EnfermeroID == enfermeroId)
                .Include(s => s.Interno)
                .Include(s => s.Especialidad)
                .Include(s => s.Especialista)
                .Select(s => new
                {
                    id = s.Id,

                    interno = s.Interno == null
                        ? null
                        : new
                        {
                            id = s.Interno.Id,
                            nombre = s.Interno.Nombre,
                            apellido = s.Interno.Apellido,
                            nombreCompleto =
                                s.Interno.Nombre + " " +
                                s.Interno.Apellido
                        },

                    especialidad = s.Especialidad == null
                        ? null
                        : s.Especialidad.Nombre,

                    especialista = s.Especialista == null
                        ? null
                        : s.Especialista.NombreCompleto,

                    motivo = s.Motivo,

                    observaciones = s.Observaciones,

                    fechaSolicitud = s.FechaSolicitud,

                    fechaAsignacion = s.FechaAsignacion,

                    estado = s.Estado
                })
                .FirstOrDefaultAsync();


            if (asignacion == null)
            {
                return NotFound(new
                {
                    mensaje = "La asignación no existe o no pertenece a este enfermero."
                });
            }


            return Ok(asignacion);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerEnfermero(int id)
        {
            var enfermero = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Id == id &&
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "Enfermero")
                .Select(u => new
                {
                    id = u.Id,
                    nombreCompleto = u.NombreCompleto,
                    correo = u.Correo
                })
                .FirstOrDefaultAsync();


            if (enfermero == null)
            {
                return NotFound(new
                {
                    mensaje = "El enfermero no existe."
                });
            }


            return Ok(enfermero);
        }
    }
}