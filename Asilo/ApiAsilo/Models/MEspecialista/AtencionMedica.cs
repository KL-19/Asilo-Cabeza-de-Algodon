using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("AtencionesMedicas")]
    public class AtencionMedica
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int CitaID { get; set; }

        public DateTime FechaAtencion { get; set; }

        [StringLength(1000)]
        public string? Diagnostico { get; set; }

        [StringLength(1000)]
        public string? DiagnosticoFinal { get; set; }

        [StringLength(2000)]
        public string? Observaciones { get; set; }

        public decimal? CostoConsulta { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "En proceso";

        // Relación con Cita
        [ForeignKey("CitaID")]
        public virtual Cita? Cita { get; set; }

        //Exámenes solicitados durante esta atención
        public virtual ICollection<ExamenLaboratorio> ExamenesLaboratorio { get; set; }
            = new List<ExamenLaboratorio>();

        // Recetas generadas durante esta atención
        public virtual ICollection<Receta> Recetas { get; set; }
            = new List<Receta>();
    }
}