using Microsoft.EntityFrameworkCore;
using ApiAsilo.Data;
using ApiAsilo.Services;

var builder = WebApplication.CreateBuilder(args);

// Permitir que la página web se conecte a la API
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirWeb", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CadenaSQL")));

builder.Services.AddScoped<AuthService>();
builder.Services.AddControllers();
builder.Services.AddScoped<AtencionMedicaService>();
builder.Services.AddScoped<CargoCuentaService>();
var app = builder.Build();

app.UseCors("PermitirWeb"); 
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();