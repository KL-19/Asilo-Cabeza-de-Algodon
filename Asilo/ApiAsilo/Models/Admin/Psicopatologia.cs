using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Psicopatologias")]
    public class Psicopatologia
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        [StringLength(500)]
        public string CondicionPadecimiento { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Observaciones { get; set; }

        public bool Activa { get; set; } = true;

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }
    }
}