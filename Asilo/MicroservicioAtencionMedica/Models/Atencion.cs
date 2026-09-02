namespace MicroservicioAtencionMedica.Models;

public class Atencion
{
    public int Id { get; set; }
    public int ResidenteId { get; set; }
    public int EspecialistaId { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string Motivo { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
    public Examen? Examen { get; set; }
    public Receta? Receta { get; set; }
}

public class Examen
{
    public string Tipo { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
}

public class Receta
{
    public string Medicamento { get; set; } = string.Empty;
    public string Dosis { get; set; } = string.Empty;
    public string Frecuencia { get; set; } = string.Empty;
    public string Duracion { get; set; } = string.Empty;
}