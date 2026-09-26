using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("SolicitudesEspecialista")]
    public class SolicitudEspecialista
    {
        [Key]
        public int Id { get; set; }

        public int? EvaluacionID { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        public int MedicoGeneralID { get; set; }

        public int? EnfermeroID { get; set; }

        public int? EspecialistaID { get; set; }

        public int? EspecialidadID { get; set; }

        [Required]
        [StringLength(500)]
        public string Motivo { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        public DateTime FechaSolicitud { get; set; }

        public DateTime? FechaAsignacion { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pendiente";

        [ForeignKey("EvaluacionID")]
        public virtual EvaluacionMedica? Evaluacion { get; set; }

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }

        [ForeignKey("MedicoGeneralID")]
        public virtual Usuario? MedicoGeneral { get; set; }

        [ForeignKey("EnfermeroID")]
        public virtual Usuario? Enfermero { get; set; }

        [ForeignKey("EspecialistaID")]
        public virtual Usuario? Especialista { get; set; }

        [ForeignKey("EspecialidadID")]
        public virtual Especialidad? Especialidad { get; set; }
    }
}