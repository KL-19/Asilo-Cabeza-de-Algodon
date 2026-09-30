using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("ExamenesLaboratorio")]
    public class ExamenLaboratorio
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int AtencionMedicaID { get; set; }

        [Required]
        [StringLength(150)]
        public string TipoExamen { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Indicaciones { get; set; }

        public DateTime FechaSolicitud { get; set; }

        public DateTime? FechaTomaMuestra { get; set; }

        public decimal? Costo { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pendiente";

        [ForeignKey("AtencionMedicaID")]
        public virtual AtencionMedica? AtencionMedica { get; set; }

        public virtual ResultadoLaboratorio? Resultado { get; set; }
    }
}