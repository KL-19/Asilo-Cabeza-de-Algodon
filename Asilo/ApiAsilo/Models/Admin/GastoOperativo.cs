using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("GastosOperativos")]
    public class GastoOperativo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string TipoGasto { get; set; } = string.Empty;

        [Required]
        public DateTime FechaGasto { get; set; }

        [Required]
        public decimal Monto { get; set; }

        [StringLength(150)]
        public string? ProveedorBeneficiario { get; set; }

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [StringLength(50)]
        public string MetodoPago { get; set; } = string.Empty;

        [StringLength(100)]
        public string? NumeroReferencia { get; set; }

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        public int? RegistradoPorUsuarioID { get; set; }
    }
}