using Microsoft.EntityFrameworkCore;
using ApiAsilo.Models;

namespace ApiAsilo.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Donacion> Donaciones { get; set; }
        public DbSet<Interno> Internos { get; set; }
        public DbSet<Familiar> Familiares { get; set; }
        public DbSet<Psicopatologia> Psicopatologias { get; set; }
        public DbSet<MedicamentoCajon> MedicamentosCajon { get; set; }
        public DbSet<Especialidad> Especialidades { get; set; }
        public DbSet<PerfilUsuario> PerfilesUsuario { get; set; }
        public DbSet<GastoOperativo> GastosOperativos { get; set; }
        public DbSet<CuotaMensual> CuotasMensuales { get; set; }
        public DbSet<EvaluacionMedica> EvaluacionesMedicas { get; set; }
        public DbSet<SolicitudEspecialista> SolicitudesEspecialista { get; set; }
    }
}