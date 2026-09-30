using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("DetalleReceta")]
    public class DetalleReceta
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int RecetaID { get; set; }

        [Required]
        [StringLength(150)]
        public string Medicamento { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Dosis { get; set; }

        [StringLength(100)]
        public string? Frecuencia { get; set; }

        [StringLength(100)]
        public string? Duracion { get; set; }

        public int? Cantidad { get; set; }

        [StringLength(500)]
        public string? Indicaciones { get; set; }

        [ForeignKey("RecetaID")]
        public virtual Receta? Receta { get; set; }
    }
}