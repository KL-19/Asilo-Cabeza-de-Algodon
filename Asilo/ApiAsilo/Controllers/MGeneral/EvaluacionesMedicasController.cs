using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluacionesMedicasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EvaluacionesMedicasController(AppDbContext context)
        {
            _context = context;
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
                .FirstOrDefaultAsync(i => i.Id == datos.InternoID);
            if (interno == null)
            {
                return NotFound(new
                {
                    mensaje = "El interno no existe."
                });
            }if (!interno.Activo){
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
            if (medicoGeneral == null){
                return BadRequest(new
                {
                    mensaje = "El médico general no existe o está inactivo."
                });
            }if (medicoGeneral.Rol == null || medicoGeneral.Rol.Nombre != "MedicoGeneral")
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
                // Especialidad
                if (!datos.EspecialidadID.HasValue){
                    return BadRequest(new
                    {
                        mensaje = "Debe seleccionar una especialidad."
                    });
                }

                // Enfermero
                if (!datos.EnfermeroID.HasValue){
                    return BadRequest(new
                    {
                        mensaje = "Debe seleccionar un enfermero(a)."
                    });
                }

                // Buscar especialidad
                especialidad = await _context.Especialidades
                    .FirstOrDefaultAsync(e => e.Id == datos.EspecialidadID.Value && e.Activo);
                if (especialidad == null){
                    return BadRequest(new
                    {
                        mensaje = "La especialidad seleccionada no existe o está inactiva."
                    });
                }
        
                // Buscar enfermero
                enfermero = await _context.Usuarios
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u =>  u.Id == datos.EnfermeroID.Value && u.Activo);
                if (enfermero == null){
                    return BadRequest(new
                    {
                        mensaje = "El enfermero(a) seleccionado no existe o está inactivo."
                    });
                }

                // Verificar rol de enfermero
                if (enfermero.Rol == null || enfermero.Rol.Nombre != "Enfermero") {
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

            if (solicitud != null)
            {
                return Ok(new
                {
                    mensaje = "Evaluación registrada y solicitud de especialista creada correctamente.",
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