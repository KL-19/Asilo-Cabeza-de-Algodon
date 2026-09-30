using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAsilo.Models
{
    [Table("EntregasFarmacia")]
    public class EntregaFarmacia
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int RecetaID { get; set; }

        public DateTime? FechaEntrega { get; set; }

        public int? EntregadoPorUsuarioID { get; set; }

        [Required]
        [StringLength(30)]
        public string Estado { get; set; } = "Pendiente";

        public decimal? CostoTotal { get; set; }

        [StringLength(1000)]
        public string? Observaciones { get; set; }

        [ForeignKey("RecetaID")]
        public virtual Receta? Receta { get; set; }

        [ForeignKey("EntregadoPorUsuarioID")]
        public virtual Usuario? EntregadoPorUsuario { get; set; }
    }
}