using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Models;
using ApiAsilo.Services;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuthService _authService;

        public AuthController(AppDbContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            // 1. Buscar en SQL Server por NombreUsuario o Correo
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.NombreUsuario == dto.Usuario || u.Correo == dto.Usuario);

            if (usuario == null || !usuario.Activo)
            {
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
            }

            // 2. Validar contraseña contra el Hash de la BD
            bool esValida = _authService.VerifyPassword(usuario, usuario.PasswordHash, dto.Password);

            if (!esValida)
            {
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });
            }

            // 3. Login Exitoso
            return Ok(new { 
                mensaje = "Acceso concedido", 
                usuarioId = usuario.Id,
                usuario = usuario.NombreUsuario,
                rol = usuario.Rol?.Nombre 
            });
        }
    }

    public class LoginDTO
    {
        public string Usuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}