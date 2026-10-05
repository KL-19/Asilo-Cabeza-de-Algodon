using ApiAsilo.Data;
using ApiAsilo.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiAsilo.Services
{
    public class AtencionMedicaService
    {
        private readonly AppDbContext _context;
        public AtencionMedicaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task VerificarEstadoAtencion(int atencionId)
        {
            var atencion = await _context.AtencionesMedicas
                .Include(a => a.Cita)
                .FirstOrDefaultAsync(a => a.ID == atencionId);
            if (atencion == null)
            {
                return;
            }

            // 1. VERIFICAR LABORATORIO
            var examenes = await _context.ExamenesLaboratorio.Where(e => e.AtencionMedicaID == atencionId).ToListAsync();
            bool tieneLaboratorio = examenes.Any();
            bool laboratorioCompletado =
                !tieneLaboratorio ||
                examenes.All(e =>
                    e.Estado.Equals(
                        "Completado",
                        StringComparison.OrdinalIgnoreCase
                    )
                );

            // 2. VERIFICAR FARMACIA
            var recetas = await _context.Recetas.Where(r => r.AtencionMedicaID == atencionId).ToListAsync();
            bool tieneFarmacia = recetas.Any();
            bool farmaciaCompletada = true;
            if (tieneFarmacia)
            {
                var recetaIds = recetas.Select(r => r.ID).ToList();
                var entregas = await _context.EntregasFarmacia.Where(e => recetaIds.Contains(e.RecetaID)).ToListAsync();

                farmaciaCompletada =
                    recetas.All(r =>
                        entregas.Any(e =>
                            e.RecetaID == r.ID && e.Estado.Equals("Completado",StringComparison.OrdinalIgnoreCase)
                        )
                    );
            }

            // 3. VERIFICAR DIAGNÓSTICO FINAL
            bool tieneDiagnosticoFinal = !string.IsNullOrWhiteSpace(atencion.DiagnosticoFinal);

            // 4. DETERMINAR ESTADO DE LA ATENCIÓN
            // CASO 1: SIN LABORATORIO Y SIN FARMACIA
            if (!tieneLaboratorio && !tieneFarmacia)
            {
                atencion.Estado = "Completada";
            }

            // CASO 2: SOLO FARMACIA
            else if (!tieneLaboratorio && tieneFarmacia)
            {
                if (farmaciaCompletada)
                {
                    atencion.Estado = "Completada";
                }
                else
                {
                    atencion.Estado = "Pendiente";
                }
            }

            // CASO 3: SOLO LABORATORIO
            else if (tieneLaboratorio && !tieneFarmacia)
            {
                if (!laboratorioCompletado)
                {
                    atencion.Estado = "Pendiente resultados";
                }
                else if (!tieneDiagnosticoFinal)
                {
                    atencion.Estado = "Pendiente";
                }
                else
                {
                    atencion.Estado = "Completada";
                }
            }

            // CASO 4: LABORATORIO + FARMACIA
            else if (tieneLaboratorio && tieneFarmacia)
            {
                if (!laboratorioCompletado)
                {
                    atencion.Estado = "Pendiente resultados";
                }

                else if (!farmaciaCompletada)
                {
                    atencion.Estado = "Pendiente";
                }

                else if (!tieneDiagnosticoFinal)
                {
                    atencion.Estado = "Pendiente";
                }

                else
                {
                    atencion.Estado = "Completada";
                }
            }

            if (
                atencion.Estado == "Completada" && atencion.Cita != null
            )
            {
                atencion.Cita.Estado = "Completada";
            }
            await _context.SaveChangesAsync();
        }
    }
}