using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;
using ApiAsilo.Services;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluacionesMedicasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        public EvaluacionesMedicasController(
            AppDbContext context,
            EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("interno/{internoId}")]
        public async Task<IActionResult> ObtenerHistorial(int internoId)
        {
            var historial = await _context.EvaluacionesMedicas
                .Where(e => e.InternoID == internoId)
                .OrderByDescending(e => e.FechaEvaluacion)
                .Select(e => new
                {
                    id = e.Id,
                    fechaEvaluacion = e.FechaEvaluacion,
                    medicoGeneralId = e.MedicoGeneralID,
                    medicoGeneral = _context.Usuarios
                        .Where(u => u.Id == e.MedicoGeneralID)
                        .Select(u => u.NombreCompleto)
                        .FirstOrDefault(),
                    motivoConsulta = e.MotivoConsulta,
                    presionArterial = e.PresionArterial,
                    temperatura = e.Temperatura,
                    frecuenciaCardiaca = e.FrecuenciaCardiaca,
                    saturacionOxigeno = e.SaturacionOxigeno,
                    diagnostico = e.Diagnostico,
                    tratamiento = e.Tratamiento,
                    observaciones = e.Observaciones,
                    requiereEspecialista = e.RequiereEspecialista
                })
                .ToListAsync();
            return Ok(historial);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerEvaluacion(int id)
        {
            var evaluacion = await _context.EvaluacionesMedicas
                .Where(e => e.Id == id)
                .Select(e => new
                {
                    id = e.Id,
                    internoId = e.InternoID,
                    medicoGeneralId = e.MedicoGeneralID,
                    medicoGeneral = _context.Usuarios
                        .Where(u => u.Id == e.MedicoGeneralID)
                        .Select(u => u.NombreCompleto)
                        .FirstOrDefault(),
                    fechaEvaluacion = e.FechaEvaluacion,
                    motivoConsulta = e.MotivoConsulta,
                    presionArterial = e.PresionArterial,
                    temperatura = e.Temperatura,
                    frecuenciaCardiaca = e.FrecuenciaCardiaca,
                    saturacionOxigeno = e.SaturacionOxigeno,
                    diagnostico = e.Diagnostico,
                    tratamiento = e.Tratamiento,
                    observaciones = e.Observaciones,
                    requiereEspecialista = e.RequiereEspecialista
                })
                .FirstOrDefaultAsync();
            if (evaluacion == null)
            {
                return NotFound(new
                {
                    mensaje = "La evaluación médica no existe."
                });
            }
            return Ok(evaluacion);
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarEvaluacion(
            [FromBody] RegistrarEvaluacionDTO datos)
        {
            // 1. VALIDAR INTERNO
            var interno = await _context.Internos
                .Include(i => i.Familiar)
                .FirstOrDefaultAsync(i => i.Id == datos.InternoID);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El interno no existe."
                });
            }

            if (!interno.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El interno se encuentra dado de baja."
                });
            }

            // 2. VALIDAR MEDICO GENERAL
            var medicoGeneral = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u =>
                    u.Id == datos.MedicoGeneralID &&
                    u.Activo);

            if (medicoGeneral == null)
            {
                return BadRequest(new
                {
                    mensaje = "El médico general no existe o está inactivo."
                });
            }

            if (medicoGeneral.Rol == null ||
                medicoGeneral.Rol.Nombre != "MedicoGeneral")
            {
                return BadRequest(new
                {
                    mensaje = "El usuario seleccionado no tiene el rol de Médico General."
                });
            }

            // 3. VARIABLES PARA ESPECIALISTA
            Especialidad? especialidad = null;
            Usuario? enfermero = null;

            // 4. VALIDAR ESPECIALIDAD Y ENFERMERO
            if (datos.RequiereEspecialista)
            {
                if (!datos.EspecialidadID.HasValue)
                {
                    return BadRequest(new
                    {
                        mensaje = "Debe seleccionar una especialidad."
                    });
                }

                if (!datos.EnfermeroID.HasValue)
                {
                    return BadRequest(new
                    {
                        mensaje = "Debe seleccionar un enfermero(a)."
                    });
                }

                especialidad = await _context.Especialidades.FirstOrDefaultAsync(e => e.Id == datos.EspecialidadID.Value && e.Activo);
                if (especialidad == null)
                {
                    return BadRequest(new
                    {
                        mensaje = "La especialidad seleccionada no existe o está inactiva."
                    });
                }

                enfermero = await _context.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u =>
                        u.Id == datos.EnfermeroID.Value &&
                        u.Activo);
                if (enfermero == null)
                {
                    return BadRequest(new
                    {
                        mensaje = "El enfermero(a) seleccionado no existe o está inactivo."
                    });
                }

                if (enfermero.Rol == null ||
                    enfermero.Rol.Nombre != "Enfermero")
                {
                    return BadRequest(new
                    {
                        mensaje = "El usuario seleccionado no tiene el rol de Enfermero."
                    });
                }
            }

            // 5. CREAR EVALUACION MEDICA
            var evaluacion = new EvaluacionMedica
            {
                InternoID = datos.InternoID,
                MedicoGeneralID = datos.MedicoGeneralID,
                FechaEvaluacion = DateTime.Now,
                MotivoConsulta = datos.MotivoConsulta,
                PresionArterial = datos.PresionArterial,
                Temperatura = datos.Temperatura,
                FrecuenciaCardiaca = datos.FrecuenciaCardiaca,
                SaturacionOxigeno = datos.SaturacionOxigeno,
                Diagnostico = datos.Diagnostico,
                Tratamiento = datos.Tratamiento,
                Observaciones = datos.Observaciones,
                RequiereEspecialista = datos.RequiereEspecialista
            };
            _context.EvaluacionesMedicas.Add(evaluacion);

            // 6. CREAR SOLICITUD SI REQUIERE ESPECIALISTA
            SolicitudEspecialista? solicitud = null;
            if (datos.RequiereEspecialista)
            {
                solicitud = new SolicitudEspecialista
                {
                    Evaluacion = evaluacion,
                    InternoID = datos.InternoID,
                    MedicoGeneralID = datos.MedicoGeneralID,
                    EnfermeroID = datos.EnfermeroID,
                    EspecialistaID = null,
                    EspecialidadID = datos.EspecialidadID,
                    Motivo = datos.MotivoConsulta,
                    Observaciones = datos.Observaciones,
                    FechaSolicitud = DateTime.Now,
                    FechaAsignacion = null,
                    Estado = "Pendiente"
                };
                _context.SolicitudesEspecialista.Add(solicitud);
            }

            // 7. GUARDAR
            await _context.SaveChangesAsync();

            // 8. ENVIAR CORREO AL FAMILIAR
            if (solicitud != null)
            {
                var familiar = interno.Familiar;
                if (familiar != null &&
                    !string.IsNullOrWhiteSpace(familiar.Correo))
                {
                    var nombreEspecialidad = especialidad?.Nombre ?? "Especialidad médica";

                    var mensajeCorreo = $@"
                        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <p>Estimado familiar responsable:</p>

                            <p>
                                Le informamos que el Médico General ha realizado una
                                evaluación médica a su familiar
                                <strong>{interno.Nombre} {interno.Apellido}</strong>
                                y ha generado una solicitud de atención con un médico especialista.
                            </p>

                            <p>
                                <strong>Especialidad solicitada:</strong>
                                {nombreEspecialidad}
                            </p>

                            <p>
                                <strong>Diagnóstico de la valoración:</strong>
                                {datos.Diagnostico}
                            </p>

                            <p>
                                <strong>Motivo:</strong>
                                {datos.MotivoConsulta}
                            </p>

                            <p>
                                <strong>Estado:</strong>
                                Pendiente de programación
                            </p>

                            <p>
                                La Fundación gestionará la asignación del médico especialista
                                y la programación de la atención.
                                Posteriormente recibirá una nueva notificación con la
                                información de la cita.
                            </p>

                            <p>
                                Atentamente,<br>
                                <strong>Asilo de Ancianos Nueva Vida</strong>
                            </p>
                        </div>";
                    await _emailService.EnviarCorreoAsync(
                        familiar.Correo, "Nueva solicitud de atención médica especializada", mensajeCorreo
                    );
                }

                return Ok(new
                {
                    mensaje = "Evaluación registrada, solicitud de especialista creada y correo enviado correctamente.",
                    evaluacionId = evaluacion.Id,
                    solicitudId = solicitud.Id
                });
            }

            return Ok(new
            {
                mensaje = "Evaluación médica registrada correctamente.",
                evaluacionId = evaluacion.Id,
                solicitudId = (int?)null
            });
        }
    }

    public class RegistrarEvaluacionDTO
    {
        public int InternoID { get; set; }
        public int MedicoGeneralID { get; set; }
        public string MotivoConsulta { get; set; }
            = string.Empty;
        public string? PresionArterial { get; set; }
        public decimal? Temperatura { get; set; }
        public int? FrecuenciaCardiaca { get; set; }
        public int? SaturacionOxigeno { get; set; }
        public string Diagnostico { get; set; }
            = string.Empty;
        public string? Tratamiento { get; set; }
        public string? Observaciones { get; set; }
        public bool RequiereEspecialista { get; set; }
        public int? EspecialidadID { get; set; }
        public int? EnfermeroID { get; set; }
    }
}