using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FundacionController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FundacionController(AppDbContext context) {
            _context = context;
        }

        [HttpGet("solicitudes")]
        public async Task<IActionResult> ObtenerSolicitudes()
        {
            var solicitudes = await _context.SolicitudesEspecialista
                .Include(s => s.Interno)
                .Include(s => s.Especialidad)
                .Include(s => s.Enfermero)
                .Where(s => s.Estado == "Pendiente")
                .OrderByDescending(s => s.FechaSolicitud)
                .Select(s => new
                {
                    id = s.Id,
                    internoID = s.InternoID,
                    interno = s.Interno == null
                        ? null
                        : new
                        {
                            id = s.Interno.Id,
                            nombre = s.Interno.Nombre,
                            apellido = s.Interno.Apellido,
                            nombreCompleto =
                                s.Interno.Nombre + " " +
                                s.Interno.Apellido,
                            fechaNacimiento =
                                s.Interno.FechaNacimiento
                        },
                    especialidadID = s.EspecialidadID,
                    especialidad = s.Especialidad == null
                        ? null
                        : new
                        {
                            id = s.Especialidad.Id,
                            nombre = s.Especialidad.Nombre
                        },

                    enfermero = s.Enfermero == null
                        ? null
                        : new
                        {
                            id = s.Enfermero.Id,
                            nombreCompleto = s.Enfermero.NombreCompleto
                        },
                    motivo = s.Motivo,
                    observaciones = s.Observaciones,
                    fechaSolicitud = s.FechaSolicitud,
                    estado = s.Estado
                })
                .ToListAsync();
            return Ok(solicitudes);
        }

        [HttpGet("solicitudes/{id}")]
        public async Task<IActionResult> ObtenerSolicitud(int id)
        {
            var solicitud = await _context.SolicitudesEspecialista
                .Include(s => s.Interno)
                .Include(s => s.Especialidad)
                .Include(s => s.Enfermero)
                .Include(s => s.MedicoGeneral)
                .Include(s => s.Evaluacion)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (solicitud == null){
                return NotFound(new
                {
                    mensaje = "La solicitud no existe."
                });
            }
            return Ok(new
            {
                id = solicitud.Id,
                internoID = solicitud.InternoID,
                interno = solicitud.Interno == null
                    ? null
                    : new
                    {
                        id = solicitud.Interno.Id,
                        nombre = solicitud.Interno.Nombre,
                        apellido = solicitud.Interno.Apellido,
                        nombreCompleto = solicitud.Interno.Nombre + " " + solicitud.Interno.Apellido,
                        fechaNacimiento = solicitud.Interno.FechaNacimiento
                    },
                especialidadID = solicitud.EspecialidadID,
                especialidad = solicitud.Especialidad == null
                    ? null
                    : new
                    {
                        id = solicitud.Especialidad.Id,
                        nombre = solicitud.Especialidad.Nombre
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
                diagnostico = solicitud.Evaluacion == null
                    ? null
                    : solicitud.Evaluacion.Diagnostico,
                observaciones = solicitud.Observaciones,
                fechaSolicitud = solicitud.FechaSolicitud,
                estado = solicitud.Estado
            });
        }

        [HttpGet("especialistas")]
        public async Task<IActionResult> ObtenerEspecialistas(
            [FromQuery] int especialidadId)
        {
            var especialistas = await _context.Usuarios
                .Include(u => u.Rol)
                .Include(u => u.PerfilUsuario)
                    .ThenInclude(p => p!.Especialidad)
                .Where(u =>
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "MedicoEspecialista" &&
                    u.PerfilUsuario != null &&
                    u.PerfilUsuario.Activo &&
                    u.PerfilUsuario.EspecialidadID == especialidadId
                )
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    id = u.Id,
                    nombreCompleto = u.NombreCompleto,
                    especialidad = u.PerfilUsuario!.Especialidad!.Nombre
                })
                .ToListAsync();
            return Ok(especialistas);
        }

        [HttpPost("solicitudes/{id}/programar")]
        public async Task<IActionResult> ProgramarSolicitud(
            int id,
            [FromBody] ProgramarSolicitudRequest datos)
        {
            var solicitud =
                await _context.SolicitudesEspecialista
                    .FirstOrDefaultAsync(s => s.Id == id);

            if (solicitud == null){
                return NotFound(new
                {
                    mensaje = "La solicitud no existe."
                });
            }

            if (solicitud.Estado != "Pendiente"){
                return BadRequest(new
                {
                    mensaje = "Esta solicitud ya fue programada."
                });
            }

            if (datos.EspecialistaID <= 0){
                return BadRequest(new
                {
                    mensaje = "Debe seleccionar un médico especialista."
                });
            }

            if (datos.FechaHora == default)
            {
                return BadRequest(new
                {
                    mensaje = "Debe seleccionar una fecha y hora."
                });
            }

            var especialista =
                await _context.Usuarios
                    .Include(u => u.Rol)
                    .Include(u => u.PerfilUsuario)
                        .ThenInclude(p => p!.Especialidad)
                    .FirstOrDefaultAsync(u =>
                        u.Id == datos.EspecialistaID && u.Activo
                    );
            if (especialista == null){
                return BadRequest(new
                {
                    mensaje = "El médico especialista no existe o está inactivo."
                });
            }

            if (especialista.Rol == null || especialista.Rol.Nombre != "MedicoEspecialista") {
                return BadRequest(new
                {
                    mensaje = "El usuario seleccionado no es un médico especialista."
                });
            }

            if (especialista.PerfilUsuario == null || !especialista.PerfilUsuario.Activo) {
                return BadRequest(new
                {
                    mensaje = "El especialista no tiene un perfil activo."
                });
            }

            if (solicitud.EspecialidadID == null || especialista.PerfilUsuario.EspecialidadID != solicitud.EspecialidadID){
                return BadRequest(new
                {
                    mensaje = "El especialista seleccionado no pertenece a la especialidad solicitada."
                });
            }

            var citaExistente =
                await _context.Citas
                    .AnyAsync(c =>
                        c.EspecialistaID == datos.EspecialistaID &&
                        c.FechaHora == datos.FechaHora &&
                        c.Estado == "Programada"
                    );
            if (citaExistente)
            {
                return BadRequest(new
                {
                    mensaje = "El médico especialista ya tiene una cita programada para esa fecha y hora."
                });
            }
            solicitud.EspecialistaID = datos.EspecialistaID;
            solicitud.FechaAsignacion = DateTime.Now;
            solicitud.Estado = "Programada";

            var cita = new Cita
            {
                SolicitudID = solicitud.Id,
                InternoID = solicitud.InternoID,
                EspecialistaID = datos.EspecialistaID,
                FechaHora = datos.FechaHora,
                Motivo = solicitud.Motivo,
                Estado = "Programada",
                Observaciones = solicitud.Observaciones
            }
            _context.Citas.Add(cita);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "La solicitud fue programada correctamente.",
                solicitudID = solicitud.Id,
                citaID = cita.Id,
                especialistaID = datos.EspecialistaID,
                fechaHora = datos.FechaHora,
                estado = solicitud.Estado
            });
        }
    }

    public class ProgramarSolicitudRequest
    {
        public int EspecialistaID { get; set; }
        public DateTime FechaHora { get; set; }
    }
}