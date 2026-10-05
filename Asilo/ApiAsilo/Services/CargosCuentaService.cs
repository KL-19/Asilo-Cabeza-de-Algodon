using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Services
{
    public class CargoCuentaService
    {
        private readonly AppDbContext _context;
        public CargoCuentaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ActualizarCargoPorAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas
                .Include(a => a.Cita)
                    .ThenInclude(c => c!.Interno)
                .FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null || atencion.Cita?.Interno == null)
            {
                return;
            }

            var familiarId = atencion.Cita.Interno.FamiliarID;
            var internoId = atencion.Cita.Interno.Id;
            decimal costoConsulta = atencion.CostoConsulta ?? 0;
            decimal costoLaboratorio = await _context.ExamenesLaboratorio
                .Where(e =>
                    e.AtencionMedicaID == atencionId && e.Costo.HasValue).SumAsync(e => e.Costo ?? 0);
            decimal costoFarmacia = await _context.EntregasFarmacia
                .Where(e =>
                    e.Receta != null && e.Receta.AtencionMedicaID == atencionId).SumAsync(e => e.CostoTotal ?? 0);
            decimal montoOriginal = costoConsulta + costoLaboratorio + costoFarmacia;
            if (montoOriginal <= 0)
            {
                return;
            }

            // Descuento del 10%
            decimal porcentajeDescuento = 10;
            decimal descuento = montoOriginal * (porcentajeDescuento / 100);
            decimal montoFinal = montoOriginal - descuento;

            var cargo = await _context.CargosCuenta.FirstOrDefaultAsync(c => c.AtencionMedicaID == atencionId);
            if (cargo == null)
            {
                cargo = new CargoCuenta
                {
                    FamiliarID = familiarId,
                    InternoID = internoId,
                    AtencionMedicaID = atencionId,
                    Concepto = "Servicios médicos",
                    MontoOriginal = montoOriginal,
                    PorcentajeDescuento = porcentajeDescuento,
                    Monto = montoFinal,
                    FechaCargo = DateTime.Now,
                    Estado = "Pendiente"
                };
                _context.CargosCuenta.Add(cargo);
            }
            else
            {
                cargo.MontoOriginal = montoOriginal;
                cargo.PorcentajeDescuento = porcentajeDescuento;
                cargo.Monto = montoFinal;
            }
            await _context.SaveChangesAsync();
        }
    }
}