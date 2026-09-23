using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarUsuario(
            [FromBody] RegistroUsuarioDTO datos)
        {
            bool usuarioExiste = await _context.Usuarios
                .AnyAsync(u => u.NombreUsuario == datos.NombreUsuario);

            if (usuarioExiste)
            {
                return BadRequest(new
                {
                    mensaje = "El nombre de usuario ya existe."
                });
            }

            bool correoExiste = await _context.Usuarios
                .AnyAsync(u => u.Correo == datos.Correo);

            if (correoExiste)
            {
                return BadRequest(new
                {
                    mensaje = "El correo ya está registrado."
                });
            }

            var usuario = new Usuario
            {
                NombreCompleto = datos.NombreCompleto,
                NombreUsuario = datos.NombreUsuario,
                Correo = datos.Correo,

                // Guardamos la contraseña directamente
                PasswordHash = datos.Password,

                RolId = datos.RolId,
                Activo = datos.Activo
            };

            _context.Usuarios.Add(usuario);

            await _context.SaveChangesAsync();

            var perfil = new PerfilUsuario
            {
                UsuarioID = usuario.Id,
                NumeroColegiado = datos.NumeroColegiado,
                Telefono = datos.Telefono,
                Especialidad = datos.Especialidad,
                Activo = datos.Activo
            };

            _context.PerfilesUsuario.Add(perfil);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Usuario registrado correctamente.",
                id = usuario.Id
            });
        }
    }

    public class RegistroUsuarioDTO
    {
        public string NombreCompleto { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RolId { get; set; }
        public string? NumeroColegiado { get; set; }
        public string? Telefono { get; set; }
        public string? Especialidad { get; set; }
        public bool Activo { get; set; } = true;
    }
}