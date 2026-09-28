using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnfermeroController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EnfermeroController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{enfermeroId}")]
        public async Task<IActionResult> ObtenerEnfermero(int enfermeroId)
        {
            var enfermero = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Id == enfermeroId && u.Activo
                )
                .Select(u => new
                {
                    id = u.Id,
                    nombreCompleto = u.NombreCompleto,
                    rol = u.Rol != null
                        ? u.Rol.Nombre
                        : null
                })
                .FirstOrDefaultAsync();

            if (enfermero == null)
            {
                return NotFound(new
                {
                    mensaje = "El enfermero no existe o está inactivo."
                });
            }

            if (enfermero.rol != "Enfermero")
            {
                return BadRequest(new
                {
                    mensaje = "El usuario seleccionado no tiene el rol de Enfermero."
                });
            }

            return Ok(enfermero);
        }

        [HttpGet("{enfermeroId}/asignaciones")]
        public async Task<IActionResult> ObtenerAsignaciones(
            int enfermeroId)
        {
            var enfermero = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u =>
                    u.Id == enfermeroId && u.Activo
                );

            if (enfermero == null)
            {
                return NotFound(new
                {
                    mensaje = "El enfermero no existe o está inactivo."
                });
            }

            if (enfermero.Rol == null ||
                enfermero.Rol.Nombre != "Enfermero")
            {
                return BadRequest(new
                {
                    mensaje = "El usuario seleccionado no es un enfermero."
                });
            }

            var asignaciones = await _context.SolicitudesEspecialista
                .Where(s =>
                    s.EnfermeroID == enfermeroId
                )
                .OrderByDescending(s => s.FechaSolicitud)
                .Select(s => new
                {
                    solicitudId = s.Id,
                    interno = s.Interno == null
                        ? null
                        : new
                        {
                            id = s.Interno.Id,
                            nombre = s.Interno.Nombre,
                            apellido = s.Interno.Apellido,
                            nombreCompleto = s.Interno.Nombre + " " + s.Interno.Apellido,
                            fechaNacimiento = s.Interno.FechaNacimiento
                        },

                    especialidad = s.Especialidad == null
                        ? null
                        : new
                        {
                            id = s.Especialidad.Id,
                            nombre = s.Especialidad.Nombre
                        },

                    especialista = s.Especialista == null
                        ? null
                        : new
                        {
                            id = s.Especialista.Id,
                            nombreCompleto = s.Especialista.NombreCompleto
                        },

                    medicoGeneral = s.MedicoGeneral == null
                        ? null
                        : new
                        {
                            id = s.MedicoGeneral.Id,
                            nombreCompleto = s.MedicoGeneral.NombreCompleto
                        },
                    motivo = s.Motivo,
                    observaciones = s.Observaciones,
                    fechaSolicitud = s.FechaSolicitud,
                    fechaAsignacion = s.FechaAsignacion,
                    estadoSolicitud = s.Estado,
                    cita = _context.Citas
                        .Where(c =>
                            c.SolicitudID == s.Id
                        )
                        .Select(c => new
                        {
                            id = c.Id,
                            fechaHora = c.FechaHora,
                            estado = c.Estado,
                            motivo = c.Motivo,
                            observaciones =c.Observaciones
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new
            {
                enfermero = new
                {
                    id = enfermero.Id,
                    nombreCompleto = enfermero.NombreCompleto
                },

                asignaciones
            });
        }

        [HttpGet("{enfermeroId}/asignaciones/{solicitudId}")]
        public async Task<IActionResult> ObtenerDetalleAsignacion(
            int enfermeroId,
            int solicitudId)
        {
            var solicitud = await _context.SolicitudesEspecialista
                .Include(s => s.Interno)
                .Include(s => s.Especialidad)
                .Include(s => s.Especialista)
                .Include(s => s.Enfermero)
                .Include(s => s.MedicoGeneral)
                .FirstOrDefaultAsync(s => s.Id == solicitudId && s.EnfermeroID == enfermeroId);
            if (solicitud == null)
            {
                return NotFound(new
                {
                    mensaje = "La asignación no existe o no pertenece a este enfermero."
                });
            }

            var cita = await _context.Citas
                .FirstOrDefaultAsync(c =>c.SolicitudID == solicitud.Id);
            return Ok(new
            {
                solicitudId = solicitud.Id,
                interno = solicitud.Interno == null
                    ? null
                    : new
                    {
                        id = solicitud.Interno.Id,
                        nombreCompleto = solicitud.Interno.Nombre + " " + solicitud.Interno.Apellido,
                        fechaNacimiento =solicitud.Interno.FechaNacimiento
                    },
                especialidad = solicitud.Especialidad == null
                        ? null
                        : new
                        {
                            id = solicitud.Especialidad.Id,
                            nombre = solicitud.Especialidad.Nombre
                        },
                especialista = solicitud.Especialista == null
                        ? null
                        : new
                        {
                            id = solicitud.Especialista.Id,
                            nombreCompleto = solicitud.Especialista.NombreCompleto
                        },
                enfermero = solicitud.Enfermero == null
                        ? null
                        : new
                        {
                            id = solicitud.Enfermero.Id,
                            nombreCompleto = solicitud.Enfermero.NombreCompleto
                        },
                medicoGeneral = solicitud.MedicoGeneral == null
                        ? null
                        : new
                        {
                            id = solicitud.MedicoGeneral.Id,
                            nombreCompleto = solicitud.MedicoGeneral.NombreCompleto
                        },
                motivo = solicitud.Motivo,
                observaciones = solicitud.Observaciones,
                fechaSolicitud =solicitud.FechaSolicitud,
                fechaAsignacion =solicitud.FechaAsignacion,
                estado = solicitud.Estado,
                cita = cita == null
                    ? null
                    : new
                    {
                        id = cita.Id,
                        fechaHora = cita.FechaHora,
                        estado = cita.Estado,
                        motivo = cita.Motivo,
                        observaciones = cita.Observaciones
                    }
            });
        }
    }
}