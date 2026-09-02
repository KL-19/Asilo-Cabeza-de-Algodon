using Microsoft.AspNetCore.Mvc;
using MicroservicioAtencionMedica.Models;

namespace MicroservicioAtencionMedica.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AtencionesController : ControllerBase
{
    private static readonly List<Atencion> atenciones = new();

    // POST /api/atenciones
    [HttpPost]
    public IActionResult RegistrarAtencion(Atencion atencion)
    {
        atencion.Id = atenciones.Count + 1;
        atenciones.Add(atencion);

        return CreatedAtAction(
            nameof(ObtenerAtencion),
            new { id = atencion.Id },
            atencion
        );
    }

    // GET /api/atenciones/{id}
    [HttpGet("{id}")]
    public IActionResult ObtenerAtencion(int id)
    {
        var atencion = atenciones.FirstOrDefault(a => a.Id == id);

        if (atencion == null)
        {
            return NotFound(new
            {
                mensaje = "No se encontró la atención médica."
            });
        }

        return Ok(atencion);
    }

    // POST /api/atenciones/{id}/examen
    [HttpPost("{id}/examen")]
    public IActionResult RegistrarExamen(int id, Examen examen)
    {
        var atencion = atenciones.FirstOrDefault(a => a.Id == id);

        if (atencion == null)
        {
            return NotFound(new
            {
                mensaje = "No se encontró la atención médica."
            });
        }

        atencion.Examen = examen;

        return Ok(new
        {
            mensaje = "Solicitud de examen registrada correctamente.",
            atencion
        });
    }

    // POST /api/atenciones/{id}/receta
    [HttpPost("{id}/receta")]
    public IActionResult RegistrarReceta(int id, Receta receta)
    {
        var atencion = atenciones.FirstOrDefault(a => a.Id == id);

        if (atencion == null)
        {
            return NotFound(new
            {
                mensaje = "No se encontró la atención médica."
            });
        }

        atencion.Receta = receta;

        return Ok(new
        {
            mensaje = "Receta registrada correctamente.",
            atencion
        });
    }
}