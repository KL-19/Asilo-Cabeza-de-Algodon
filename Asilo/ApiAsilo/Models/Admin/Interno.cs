using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Internos")]
    public class Interno
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        public DateTime FechaNacimiento { get; set; }

        [StringLength(20)]
        public string? Genero { get; set; }

        [StringLength(20)]
        public string? DPI { get; set; }

        [Required]
        public DateTime FechaIngreso { get; set; }

        [StringLength(250)]
        public string? DireccionAnterior { get; set; }

        [StringLength(20)]
        public string? TelefonoEmergencia { get; set; }

        [Required]
        public int FamiliarID { get; set; }

        public bool Activo { get; set; } = true;

        [ForeignKey("FamiliarID")]
        public virtual Familiar? Familiar { get; set; }
        public virtual ICollection<Psicopatologia> Psicopatologias { get; set; }
        = new List<Psicopatologia>();
        public virtual ICollection<MedicamentoCajon> MedicamentosCajon { get; set; }
        = new List<MedicamentoCajon>();
    }
}