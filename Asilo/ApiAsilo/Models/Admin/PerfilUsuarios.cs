using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("PerfilesUsuario")]
    public class PerfilUsuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioID { get; set; }

        [StringLength(50)]
        public string? NumeroColegiado { get; set; }

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(150)]
        public string? Especialidad { get; set; }

        public bool Activo { get; set; } = true;

        [ForeignKey("UsuarioID")]
        public virtual Usuario? Usuario { get; set; }
    }
}