using ApiAsilo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CitasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CitasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("especialista/{usuarioId}")]
        public async Task<IActionResult> ObtenerCitasEspecialista(int usuarioId)
        {
            var citas = await _context.Citas
                .AsNoTracking()
                .Where(c => c.EspecialistaID == usuarioId)
                .OrderBy(c => c.FechaHora)
                .Select(c => new
                {
                    id = c.Id,
                    solicitudID = c.SolicitudID,
                    internoID = c.InternoID,
                    especialistaID = c.EspecialistaID,
                    fechaHora = c.FechaHora,
                    motivo = c.Motivo,
                    estado = c.Estado,
                    observaciones = c.Observaciones,

                    interno = c.Interno == null
                        ? null
                        : new
                        {
                            id = c.Interno.Id,
                            nombre = c.Interno.Nombre,
                            apellido = c.Interno.Apellido,
                            fechaNacimiento = c.Interno.FechaNacimiento,
                            genero = c.Interno.Genero,
                            dpi = c.Interno.DPI
                        },

                    especialista = c.Especialista == null
                        ? null
                        : new
                        {
                            id = c.Especialista.Id,
                            nombreUsuario = c.Especialista.NombreUsuario,
                            nombreCompleto = c.Especialista.NombreCompleto,
                            correo = c.Especialista.Correo
                        },

                    solicitud = c.Solicitud == null
                        ? null
                        : new
                        {
                            id = c.Solicitud.Id,
                            evaluacionID = c.Solicitud.EvaluacionID,
                            internoID = c.Solicitud.InternoID,
                            medicoGeneralID = c.Solicitud.MedicoGeneralID,
                            enfermeroID = c.Solicitud.EnfermeroID,
                            especialistaID = c.Solicitud.EspecialistaID,
                            especialidadID = c.Solicitud.EspecialidadID,
                            motivo = c.Solicitud.Motivo,
                            observaciones = c.Solicitud.Observaciones,
                            fechaSolicitud = c.Solicitud.FechaSolicitud,
                            fechaAsignacion = c.Solicitud.FechaAsignacion,
                            estado = c.Solicitud.Estado,
                            
                            enfermero = c.Solicitud.Enfermero == null
                                    ? null
                                    : new
                                    {
                                        id = c.Solicitud.Enfermero.Id,
                                        nombreUsuario = c.Solicitud.Enfermero.NombreUsuario,
                                        nombreCompleto = c.Solicitud.Enfermero.NombreCompleto
                                    }
                        }
                })
                .ToListAsync();

            return Ok(citas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerCita(int id)
        {
            var cita = await _context.Citas
                .AsNoTracking()
                .Where(c => c.Id == id
                .Select(c => new
                {
                    id = c.Id,
                    solicitudID = c.SolicitudID,
                    internoID = c.InternoID,
                    especialistaID = c.EspecialistaID,
                    fechaHora = c.FechaHora,
                    motivo = c.Motivo,
                    estado = c.Estado,
                    observaciones = c.Observaciones,

                    interno = c.Interno == null
                        ? null
                        : new
                        {
                            id = c.Interno.Id,
                            nombre = c.Interno.Nombre,
                            apellido = c.Interno.Apellido,
                            fechaNacimiento = c.Interno.FechaNacimiento,
                            genero = c.Interno.Genero,
                            dpi = c.Interno.DPI
                        },

                    especialista = c.Especialista == null
                        ? null
                        : new
                        {
                            id = c.Especialista.Id,
                            nombreUsuario = c.Especialista.NombreUsuario,
                            nombreCompleto = c.Especialista.NombreCompleto,
                            correo = c.Especialista.Correo
                        },

                    solicitud = c.Solicitud == null
                        ? null
                        : new
                        {
                            id = c.Solicitud.Id,
                            evaluacionID = c.Solicitud.EvaluacionID,
                            internoID = c.Solicitud.InternoID,
                            medicoGeneralID = c.Solicitud.MedicoGeneralID,
                            enfermeroID = c.Solicitud.EnfermeroID,
                            especialistaID = c.Solicitud.EspecialistaID,
                            especialidadID = c.Solicitud.EspecialidadID,
                            motivo = c.Solicitud.Motivo,
                            observaciones = c.Solicitud.Observaciones,
                            fechaSolicitud = c.Solicitud.FechaSolicitud,
                            fechaAsignacion = c.Solicitud.FechaAsignacion,
                            estado = c.Solicitud.Estado,
                            enfermero = c.Solicitud.Enfermero == null
                                    ? null
                                    : new
                                    {
                                        id = c.Solicitud.Enfermero.Id,
                                        nombreUsuario = c.Solicitud.Enfermero.NombreUsuario,
                                        nombreCompleto = c.Solicitud.Enfermero.NombreCompleto
                                    }
                        }
                })
                .FirstOrDefaultAsync();

            if (cita == null)
            {
                return NotFound(new
                {
                    mensaje = "La cita no existe."
                });
            }
            return Ok(cita);
        }
    }
}