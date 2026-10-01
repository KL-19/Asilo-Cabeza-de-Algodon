using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("Recetas")]
    public class Receta
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int AtencionMedicaID { get; set; }

        public DateTime FechaReceta { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pendiente";

        [ForeignKey("AtencionMedicaID")]
        public virtual AtencionMedica? AtencionMedica { get; set; }

        public virtual ICollection<DetalleReceta> Detalles { get; set; }
            = new List<DetalleReceta>();
    }
}