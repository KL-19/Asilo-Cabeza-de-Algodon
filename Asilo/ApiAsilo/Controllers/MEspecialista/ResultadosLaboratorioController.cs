using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultadosLaboratorioController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ResultadosLaboratorioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("examen/{examenId}")]
        public async Task<ActionResult> GetResultadoPorExamen(int examenId)
        {
            var examen = await _context.ExamenesLaboratorio
                .FirstOrDefaultAsync(e => e.ID == examenId);
            if (examen == null)
            {
                return NotFound(new
                {
                    mensaje = "El examen de laboratorio no fue encontrado."
                });
            }
            var resultado = await _context.ResultadosLaboratorio
                .FirstOrDefaultAsync(r => r.ExamenLaboratorioID == examenId);
            if (resultado == null)
            {
                return Ok(new
                {
                    existe = false,
                    examen = examen
                });
            }
            return Ok(new
            {
                existe = true,
                resultado = resultado,
                examen = examen
            });
        }

        [HttpGet("atencion/{atencionId}")]
        public async Task<ActionResult> GetResultadosPorAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas
                .FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null)
            {
                return NotFound(new
                {
                    mensaje = "La atención médica no fue encontrada."
                });
            }

            var resultados = await _context.ResultadosLaboratorio
                .Include(r => r.ExamenLaboratorio)
                .Where(r => r.ExamenLaboratorio!.AtencionMedicaID == atencionId)
                .OrderBy(r => r.ID)
                .ToListAsync();
            return Ok(resultados);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetResultado(int id)
        {
            var resultado = await _context.ResultadosLaboratorio
                .Include(r => r.ExamenLaboratorio)
                .FirstOrDefaultAsync(r => r.ID == id);
            if (resultado == null)
            {
                return NotFound(new
                {
                    mensaje = "El resultado de laboratorio no fue encontrado."
                });
            }
            return Ok(resultado);
        }

        [HttpPost]
        public async Task<ActionResult> PostResultado(
            ResultadoLaboratorio resultado)
        {
            var examen = await _context.ExamenesLaboratorio
                .FirstOrDefaultAsync(e => e.ID == resultado.ExamenLaboratorioID);
            if (examen == null)
            {
                return BadRequest(new
                {
                    mensaje = "El examen de laboratorio indicado no existe."
                });
            }

            var resultadoExistente = await _context.ResultadosLaboratorio
                .FirstOrDefaultAsync(
                    r => r.ExamenLaboratorioID == resultado.ExamenLaboratorioID
                );
            if (resultadoExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "Este examen ya tiene un resultado registrado.",
                    resultadoId = resultadoExistente.ID
                });
            }
            if (string.IsNullOrWhiteSpace(resultado.Resultado))
            {
                return BadRequest(new
                {
                    mensaje = "Debe ingresar el resultado del examen."
                });
            }
            resultado.FechaResultado = DateTime.Now;
            resultado.ExamenLaboratorio = null;
            _context.ResultadosLaboratorio.Add(resultado);
            examen.Estado = "Completado";
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetResultado),
                new { id = resultado.ID },
                resultado
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutResultado(
            int id,
            ResultadoLaboratorio resultado)
        {
            var resultadoExistente = await _context.ResultadosLaboratorio
                .FirstOrDefaultAsync(r => r.ID == id);
            if (resultadoExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El resultado de laboratorio no fue encontrado."
                });
            }

            if (string.IsNullOrWhiteSpace(resultado.Resultado))
            {
                return BadRequest(new
                {
                    mensaje = "Debe ingresar el resultado."
                });
            }
            resultadoExistente.Resultado = resultado.Resultado;
            resultadoExistente.Observaciones = resultado.Observaciones;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "El resultado fue actualizado correctamente.",
                resultado = resultadoExistente
            });
        }
    }
}