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
    }
}