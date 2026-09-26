using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("EvaluacionesMedicas")]
    public class EvaluacionMedica
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        public int MedicoGeneralID { get; set; }

        public DateTime FechaEvaluacion { get; set; }

        [Required]
        [StringLength(500)]
        public string MotivoConsulta { get; set; } = string.Empty;

        [StringLength(20)]
        public string? PresionArterial { get; set; }

        public decimal? Temperatura { get; set; }

        public int? FrecuenciaCardiaca { get; set; }

        public int? SaturacionOxigeno { get; set; }

        [Required]
        [StringLength(1000)]
        public string Diagnostico { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Tratamiento { get; set; }

        [StringLength(2000)]
        public string? Observaciones { get; set; }

        public bool RequiereEspecialista { get; set; }

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }
    }
}