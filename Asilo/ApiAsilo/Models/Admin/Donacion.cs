using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Donaciones")]
    public class Donacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoDonante { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string NombreDonante { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(150)]
        public string? Correo { get; set; }

        [Required]
        public decimal Monto { get; set; }

        [Required]
        [StringLength(50)]
        public string FormaRecepcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaRecepcion { get; set; }

        [StringLength(100)]
        public string? NumeroReferencia { get; set; }

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        public int? RegistradoPorUsuarioID { get; set; }
    }
}