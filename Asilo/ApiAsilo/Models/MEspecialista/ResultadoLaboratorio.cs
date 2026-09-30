using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("ResultadosLaboratorio")]
    public class ResultadoLaboratorio
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int ExamenLaboratorioID { get; set; }

        public DateTime FechaResultado { get; set; }

        [Required]
        public string Resultado { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Observaciones { get; set; }

        public int? RegistradoPorUsuarioID { get; set; }

        [ForeignKey("ExamenLaboratorioID")]
        public virtual ExamenLaboratorio? ExamenLaboratorio { get; set; }

        [ForeignKey("RegistradoPorUsuarioID")]
        public virtual Usuario? RegistradoPorUsuario { get; set; }
    }
}