using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ApiAsilo.Data;
using ApiAsilo.Models;

namespace ApiAsilo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InternosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InternosController(AppDbContext context)
        {
            _context = context;
        }
        //obtener todos los internos
        [HttpGet]
        public async Task<IActionResult> ObtenerInternos()
        {
            var internos = await _context.Internos
                .Include(i => i.Familiar)
                .Include(i => i.Psicopatologias)
                .Include(i => i.MedicamentosCajon)
                .OrderBy(i => i.Nombre)
                .Select(i => new
                {
                    id = i.Id,
                    nombre = i.Nombre,
                    apellido = i.Apellido,
                    nombreCompleto = i.Nombre + " " + i.Apellido,
                    fechaNacimiento = i.FechaNacimiento,
                    genero = i.Genero,
                    dpi = i.DPI,
                    fechaIngreso = i.FechaIngreso,
                    direccion = i.DireccionAnterior,
                    telefonoEmergencia = i.TelefonoEmergencia,
                    activo = i.Activo,

                    // Familiar responsable
                    familiar = i.Familiar == null ? null : new
                    {
                        nombreCompleto = i.Familiar.NombreCompleto,
                        parentesco = i.Familiar.Parentesco,
                        telefono = i.Familiar.Telefono,
                        correo = i.Familiar.Correo,
                        direccion = i.Familiar.Direccion
                    },

                    // Psicopatología
                    psicopatologias = i.Psicopatologias
                        .Where(p => p.Activa)
                        .Select(p => new
                        {
                            id = p.Id,
                            condicionPadecimiento =
                            p.CondicionPadecimiento
                        })
                    .ToList(),

                    // Medicamentos de cajon
                    medicamentos = i.MedicamentosCajon
                        .Where(m => m.Activo)
                        .Select(m => new
                        {
                            id = m.Id,
                            medicamento = m.Medicamento,
                            cantidad = m.Cantidad,
                            frecuencia = m.Frecuencia,
                            tiempoAplicacion =
                            m.TiempoAplicacion
                        })
                        .ToList()
                })
                .ToListAsync();
            return Ok(internos);
        }

        //registrar interno
        [HttpPost]
        public async Task<IActionResult> RegistrarInterno([FromBody] RegistroInternoDTO datos)
        {
            Familiar familiar;
            if (datos.FamiliarID.HasValue){
                familiar = await _context.Familiares .FirstOrDefaultAsync(f => f.Id == datos.FamiliarID.Value);
                if (familiar == null){
                    return BadRequest(new
                    {
                        mensaje = "El familiar seleccionado no existe."
                    });
                }
            }else{
                familiar = new Familiar
                {
                    NombreCompleto = datos.FamiliarNombre,
                    Telefono = datos.FamiliarTelefono,
                    Correo = datos.FamiliarCorreo,
                    Direccion = datos.FamiliarDireccion,
                    Parentesco = datos.Parentesco,
                    Activo = true
                };

                _context.Familiares.Add(familiar);
                await _context.SaveChangesAsync();
            }

            // 2. Crear el interno
            var interno = new Interno
            {
                Nombre = datos.Nombre,
                Apellido = datos.Apellido,
                FechaNacimiento = datos.FechaNacimiento,
                Genero = datos.Genero,
                DPI = datos.DPI,
                FechaIngreso = datos.FechaIngreso,
                DireccionAnterior = datos.Direccion,
                TelefonoEmergencia = datos.Telefono,
                FamiliarID = familiar.Id,
                Activo = true
            };

            _context.Internos.Add(interno);

            // Guardamos para obtener el ID del interno
            await _context.SaveChangesAsync();

            // 3. Guardar psicopatología si se ingresó
            if (!string.IsNullOrWhiteSpace(datos.Psicopatologia))
            {
                var psicopatologia = new Psicopatologia
                {
                    InternoID = interno.Id,
                    CondicionPadecimiento = datos.Psicopatologia,
                    Activa = true
                };

                _context.Psicopatologias.Add(psicopatologia);
            }

            // 4. Guardar los medicamentos
            if (datos.Medicamentos != null)
            {
                foreach (var medicamentoDatos in datos.Medicamentos)
                {
                    if (!string.IsNullOrWhiteSpace(medicamentoDatos.Medicamento))
                    {
                        var medicamento = new MedicamentoCajon
                        {
                            InternoID = interno.Id,
                            Medicamento = medicamentoDatos.Medicamento,
                            Cantidad = medicamentoDatos.Cantidad,
                            Frecuencia = medicamentoDatos.Frecuencia,
                            TiempoAplicacion = medicamentoDatos.TiempoAplicacion,
                            Activo = true
                        };

                        _context.MedicamentosCajon.Add(medicamento);
                    }
                }
            }

            // Guardamos psicopatología y medicamentos
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Interno registrado correctamente",
                id = interno.Id
            });
        }
        
        // dar de baja a un Interno
        [HttpPut("{id}/baja")]
        public async Task<IActionResult> DarDeBaja(int id)
        {
            var interno = await _context.Internos
                .Include(i => i.Familiar)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interno == null){
                return NotFound(new
                {
                    mensaje = "El interno no existe."
                });
            }

            if (!interno.Activo){
                return BadRequest(new
                {
                    mensaje = "El interno ya está dado de baja."
                });
            }

            interno.Activo = false;
            await _context.SaveChangesAsync();

            //actualizar estado del familiar 
            if (interno.Familiar != null){
                bool tieneOtroInternoActivo = await _context.Internos
                .AnyAsync(i => i.FamiliarID == interno.FamiliarID && i.Activo);

                interno.Familiar.Activo = tieneOtroInternoActivo;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                mensaje = "Interno dado de baja correctamente."
            });
        }

        // EDITAR INTERNO
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarInterno(
            int id,
            [FromBody] EditarInternoDTO datos)
        {
            var interno = await _context.Internos
                .Include(i => i.Familiar)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interno == null){
                return NotFound(new
                {
                    mensaje = "El interno no existe."
                });
            }

            // Datos del interno
            interno.Nombre = datos.Nombre;
            interno.Apellido = datos.Apellido;
            interno.FechaNacimiento = datos.FechaNacimiento;
            interno.Genero = datos.Genero;
            interno.DPI = datos.DPI;
            interno.FechaIngreso = datos.FechaIngreso;
            interno.DireccionAnterior = datos.Direccion;
            interno.TelefonoEmergencia = datos.Telefono;

            // Datos del familiar
            if (interno.Familiar != null){
                interno.Familiar.NombreCompleto = datos.FamiliarNombre;
                interno.Familiar.Parentesco = datos.Parentesco;
                interno.Familiar.Telefono = datos.FamiliarTelefono;
                interno.Familiar.Correo = datos.FamiliarCorreo;
                interno.Familiar.Direccion = datos.FamiliarDireccion;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = "Interno actualizado correctamente."
            });
        }

        // DTO que recibe la información completa del formulario
        public class RegistroInternoDTO
        {
            // Datos del interno
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public string? Genero { get; set; }
            public string? DPI { get; set; }
            public DateTime FechaIngreso { get; set; }
            public string? Direccion { get; set; }
            public string? Telefono { get; set; }

            public int? FamiliarID { get; set; }
            // Datos del familiar
            public string FamiliarNombre { get; set; } = string.Empty;
            public string Parentesco { get; set; } = string.Empty;
            public string FamiliarTelefono { get; set; } = string.Empty;
            public string FamiliarCorreo { get; set; } = string.Empty;
            public string? FamiliarDireccion { get; set; }

            // Información médica inicial
            public string? Psicopatologia { get; set; }
            public List<MedicamentoDTO>? Medicamentos { get; set; }
        }

        // DTO para cada medicamento
        public class MedicamentoDTO
        {
            public string Medicamento { get; set; } = string.Empty;
            public string Cantidad { get; set; } = string.Empty;
            public string Frecuencia { get; set; } = string.Empty;
            public string TiempoAplicacion { get; set; } = string.Empty;
        }

        //DTO editar interno
        public class EditarInternoDTO
        {
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public string? Genero { get; set; }
            public string? DPI { get; set; }
            public DateTime FechaIngreso { get; set; }
            public string? Direccion { get; set; }
            public string? Telefono { get; set; }

            public string FamiliarNombre { get; set; } = string.Empty;
            public string Parentesco { get; set; } = string.Empty;
            public string FamiliarTelefono { get; set; } = string.Empty;
            public string FamiliarCorreo { get; set; } = string.Empty;
            public string? FamiliarDireccion { get; set; }
        }   
    }
}