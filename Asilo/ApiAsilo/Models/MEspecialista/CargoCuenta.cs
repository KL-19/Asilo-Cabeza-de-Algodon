using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("CargosCuenta")]
    public class CargoCuenta
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int FamiliarID { get; set; }

        public int? InternoID { get; set; }

        public int? AtencionMedicaID { get; set; }

        [Required]
        [StringLength(250)]
        public string Concepto { get; set; } = string.Empty;

        [Required]
        public decimal MontoOriginal { get; set; }

        [Required]
        public decimal PorcentajeDescuento { get; set; }

        [Required]
        public decimal Monto { get; set; }

        public DateTime FechaCargo { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pendiente";

        // Relaciones
        [ForeignKey("FamiliarID")]
        public virtual Familiar? Familiar { get; set; }

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }

        [ForeignKey("AtencionMedicaID")]
        public virtual AtencionMedica? AtencionMedica { get; set; }
    }
}