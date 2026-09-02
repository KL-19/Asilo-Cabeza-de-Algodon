using Microsoft.AspNetCore.Mvc;
using MicroservicioSolicitudes.Models;

namespace MicroservicioSolicitudes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SolicitudesController : ControllerBase
{
    private static readonly List<SolicitudMedica> solicitudes = new();

    [HttpGet]
    public IActionResult ObtenerSolicitudes()
    {
        return Ok(solicitudes);
    }

    [HttpGet("{id}")]
    public IActionResult ObtenerSolicitud(int id)
    {
        var solicitud = solicitudes.FirstOrDefault(s => s.Id == id);

        if (solicitud == null)
        {
            return NotFound();
        }

        return Ok(solicitud);
    }

    [HttpPost]
    public IActionResult CrearSolicitud(SolicitudMedica solicitud)
    {
        solicitud.Id = solicitudes.Count + 1;
        solicitud.FechaSolicitud = DateTime.Now;
        solicitud.Estado = "Pendiente";

        solicitudes.Add(solicitud);

        return CreatedAtAction(
            nameof(ObtenerSolicitud),
            new { id = solicitud.Id },
            solicitud
        );
    }
}