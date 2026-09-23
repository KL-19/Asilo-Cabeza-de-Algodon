using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Familiares")]
    public class Familiar
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string NombreCompleto { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(150)]
        public string? Correo { get; set; }

        [StringLength(250)]
        public string? Direccion { get; set; }

        [StringLength(50)]
        public string? Parentesco { get; set; }

        public bool Activo { get; set; } = true;
    }
}