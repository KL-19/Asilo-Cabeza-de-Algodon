using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Especialidades")]
    public class Especialidad
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        public virtual ICollection<PerfilUsuario> PerfilesUsuario { get; set; }
            = new List<PerfilUsuario>();
    }
}

