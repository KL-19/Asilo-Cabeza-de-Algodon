using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("CuotasMensuales")]
    public class CuotaMensual
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        public int PeriodoAnio { get; set; }

        [Required]
        public int PeriodoMes { get; set; }

        [Required]
        public decimal Monto { get; set; }

        public DateTime? FechaPago { get; set; }

        [StringLength(50)]
        public string? MetodoPago { get; set; }

        [StringLength(100)]
        public string? NumeroReferencia { get; set; }

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pagado";

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }
    }
}