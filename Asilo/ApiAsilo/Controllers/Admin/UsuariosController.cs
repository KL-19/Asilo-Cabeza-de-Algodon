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

        //obtener todos los usuarios
        [HttpGet]
        public async Task<IActionResult> ObtenerUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.Rol)
                .Include(u => u.PerfilUsuario)
                    .ThenInclude(p => p.Especialidad)
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    id = u.Id,
                    nombreCompleto = u.NombreCompleto,
                    nombreUsuario = u.NombreUsuario,
                    correo = u.Correo,
                    rolId = u.RolId,
                    rol = u.Rol == null
                        ? null
                        : u.Rol.Nombre,
                    activo = u.Activo,

                    perfil = u.PerfilUsuario == null
                        ? null
                        : new
                        {
                            numeroColegiado =
                                u.PerfilUsuario.NumeroColegiado,

                            telefono =
                                u.PerfilUsuario.Telefono,

                            especialidad =
                                u.PerfilUsuario.Especialidad == null
                                    ? null
                                    : u.PerfilUsuario.Especialidad.Nombre
                        }
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        //registrar Usuario
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
                EspecialidadID = datos.EspecialidadID,
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

        //Editar usuario
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarUsuario(
            int id,
            [FromBody] EditarUsuarioDTO datos)
        {
            var usuario =
                await _context.Usuarios
                    .Include(u => u.PerfilUsuario)
                    .FirstOrDefaultAsync(
                        u => u.Id == id);


            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El usuario no existe."
                });
            }

            //datos del usuario
            usuario.NombreCompleto = datos.NombreCompleto;
            usuario.NombreUsuario = datos.NombreUsuario;
            usuario.Correo = datos.Correo;
            usuario.RolId = datos.RolId;

            //Contraseña
            if (!string.IsNullOrWhiteSpace(
                datos.Password))
            {
                usuario.PasswordHash = datos.Password;
            }

            //Perfil
            if (usuario.PerfilUsuario != null)
            {
                usuario.PerfilUsuario.NumeroColegiado = datos.NumeroColegiado;
                usuario.PerfilUsuario.Telefono = datos.Telefono;
                usuario.PerfilUsuario.EspecialidadID = datos.EspecialidadID;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente."
            });
        }

        //Dar de baja
        [HttpPut("{id}/baja")]
        public async Task<IActionResult> DarDeBajaUsuario(
            int id)
        {
            var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(
                        u => u.Id == id);
            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "El usuario no existe."
                });
            }

            if (!usuario.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El usuario ya está dado de baja."
                });
            }
            usuario.Activo = false;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "Usuario dado de baja correctamente."
            });
        }

        [HttpGet("enfermeros")]
        public async Task<IActionResult> ObtenerEnfermeros() {
            var enfermeros = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "Enfermero")
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    id = u.Id,
                    nombreCompleto = u.NombreCompleto
                })
                .ToListAsync();
            return Ok(enfermeros);
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
        public int? EspecialidadID { get; set; }
        public bool Activo { get; set; } = true;
    }

    //DTO Editar
    public class EditarUsuarioDTO
    {
        public string NombreCompleto { get; set; }
            = string.Empty;
        public string NombreUsuario { get; set; }
            = string.Empty;
        public string Correo { get; set; }
            = string.Empty;
        public string? Password { get; set; }
        public int RolId { get; set; }
        public string? NumeroColegiado { get; set; }
        public string? Telefono { get; set; }
        public int? EspecialidadID { get; set; }
    }
}