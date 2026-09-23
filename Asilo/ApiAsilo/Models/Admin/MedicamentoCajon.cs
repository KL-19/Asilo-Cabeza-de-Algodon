using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("MedicamentosCajon")]
    public class MedicamentoCajon
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        [StringLength(150)]
        public string Medicamento { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Cantidad { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Frecuencia { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TiempoAplicacion { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }
    }
}