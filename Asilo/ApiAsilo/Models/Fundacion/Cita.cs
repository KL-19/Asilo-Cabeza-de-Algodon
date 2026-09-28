using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Citas")]
    public class Cita
    {
        [Key]
        public int Id { get; set; }

        public int? SolicitudID { get; set; }

        [Required]
        public int InternoID { get; set; }

        [Required]
        public int EspecialistaID { get; set; }

        [Required]
        public DateTime FechaHora { get; set; }

        [StringLength(1000)]
        public string? Motivo { get; set; }

        [Required]
        [StringLength(60)]
        public string Estado { get; set; } = "Programada";

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        [ForeignKey("SolicitudID")]
        public virtual SolicitudEspecialista? Solicitud { get; set; }

        [ForeignKey("InternoID")]
        public virtual Interno? Interno { get; set; }

        [ForeignKey("EspecialistaID")]
        public virtual Usuario? Especialista { get; set; }
    }
}