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

        [HttpPost]
        public async Task<IActionResult> RegistrarInterno([FromBody] RegistroInternoDTO datos)
        {
            // 1. Crear el familiar
            var familiar = new Familiar
            {
                NombreCompleto = datos.FamiliarNombre,
                Telefono = datos.FamiliarTelefono,
                Correo = datos.FamiliarCorreo,
                Direccion = datos.FamiliarDireccion,
                Parentesco = datos.Parentesco,
                Activo = true
            };

            _context.Familiares.Add(familiar);

            // Guardamos para obtener el ID del familiar
            await _context.SaveChangesAsync();

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
}