namespace MicroservicioSolicitudes.Models;

public class SolicitudMedica
{
    public int Id { get; set; }
    public int ResidenteId { get; set; }
    public string TipoSolicitud { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    public DateTime FechaSolicitud { get; set; } = DateTime.Now;
}