-- ====================================================================
-- Creación de la Base de Datos
-- ====================================================================
CREATE DATABASE [AsiloCabezaDeAlgodon]
GO

USE [AsiloCabezaDeAlgodon]
GO

-- ====================================================================
-- Creación de Tablas
-- ====================================================================

CREATE TABLE [dbo].[Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] NVARCHAR(50) NOT NULL,
    [Descripcion] NVARCHAR(255) NULL
);

CREATE TABLE [dbo].[Usuarios] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [NombreUsuario] NVARCHAR(50) NOT NULL,
    [Correo] NVARCHAR(100) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [NombreCompleto] NVARCHAR(150) NOT NULL,
    [RolId] INT NOT NULL,
    [Activo] BIT NOT NULL,
    FOREIGN KEY ([RolId]) REFERENCES [dbo].[Roles]([Id])
);

CREATE TABLE [dbo].[Familiares] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [NombreCompleto] NVARCHAR(150) NOT NULL,
    [Telefono] NVARCHAR(20) NOT NULL,
    [Correo] NVARCHAR(100) NULL,
    [Direccion] NVARCHAR(255) NULL,
    [Parentesco] NVARCHAR(50) NOT NULL,
    [Activo] BIT NOT NULL
);

CREATE TABLE [dbo].[Internos] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] NVARCHAR(50) NOT NULL,
    [Apellido] NVARCHAR(50) NOT NULL,
    [FechaNacimiento] DATE NOT NULL,
    [DPI] NVARCHAR(20) NOT NULL,
    [FechaIngreso] DATE NOT NULL,
    [DireccionAnterior] NVARCHAR(255) NULL,
    [TelefonoEmergencia] NVARCHAR(20) NULL,
    [FamiliarID] INT NOT NULL,
    [Activo] BIT NOT NULL,
    [Genero] NVARCHAR(20) NULL,
    FOREIGN KEY ([FamiliarID]) REFERENCES [dbo].[Familiares]([ID])
);

CREATE TABLE [dbo].[PerfilesUsuario] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [UsuarioID] INT NOT NULL,
    [NumeroColegiado] NVARCHAR(50) NULL,
    [Telefono] NVARCHAR(20) NULL,
    [Activo] BIT NOT NULL,
    [EspecialidadID] INT NULL,
    FOREIGN KEY ([UsuarioID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[EvaluacionesMedicas] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [InternoID] INT NOT NULL,
    [MedicoGeneralID] INT NOT NULL,
    [FechaEvaluacion] DATETIME2 NOT NULL,
    [MotivoConsulta] NVARCHAR(MAX) NOT NULL,
    [PresionArterial] NVARCHAR(20) NULL,
    [Temperatura] DECIMAL(4,1) NULL,
    [FrecuenciaCardiaca] INT NULL,
    [SaturacionOxigeno] INT NULL,
    [Diagnostico] NVARCHAR(MAX) NOT NULL,
    [Tratamiento] NVARCHAR(MAX) NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [RequiereEspecialista] BIT NOT NULL,
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID]),
    FOREIGN KEY ([MedicoGeneralID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[Citas] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [SolicitudID] INT NOT NULL,
    [InternoID] INT NOT NULL,
    [EspecialistaID] INT NOT NULL,
    [FechaHora] DATETIME2 NOT NULL,
    [Motivo] NVARCHAR(MAX) NOT NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID]),
    FOREIGN KEY ([EspecialistaID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[AtencionesMedicas] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [CitaID] INT NOT NULL,
    [FechaAtencion] DATETIME2 NOT NULL,
    [Diagnostico] NVARCHAR(MAX) NOT NULL,
    [DiagnosticoFinal] NVARCHAR(MAX) NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    [CostoConsulta] DECIMAL(10,2) NOT NULL,
    FOREIGN KEY ([CitaID]) REFERENCES [dbo].[Citas]([ID])
);

CREATE TABLE [dbo].[ExamenesLaboratorio] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [AtencionMedicaID] INT NOT NULL,
    [TipoExamen] NVARCHAR(100) NOT NULL,
    [Indicaciones] NVARCHAR(MAX) NULL,
    [FechaSolicitud] DATETIME2 NOT NULL,
    [FechaTomaMuestra] DATETIME2 NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    [Costo] DECIMAL(10,2) NULL,
    FOREIGN KEY ([AtencionMedicaID]) REFERENCES [dbo].[AtencionesMedicas]([ID])
);

CREATE TABLE [dbo].[ResultadosLaboratorio] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [ExamenLaboratorioID] INT NOT NULL,
    [FechaResultado] DATETIME2 NOT NULL,
    [Resultado] NVARCHAR(MAX) NOT NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [RegistradoPorUsuarioID] INT NULL,
    FOREIGN KEY ([ExamenLaboratorioID]) REFERENCES [dbo].[ExamenesLaboratorio]([ID]),
    FOREIGN KEY ([RegistradoPorUsuarioID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[Recetas] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [AtencionMedicaID] INT NOT NULL,
    [FechaReceta] DATETIME2 NOT NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    FOREIGN KEY ([AtencionMedicaID]) REFERENCES [dbo].[AtencionesMedicas]([ID])
);

CREATE TABLE [dbo].[DetalleReceta] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [RecetaID] INT NOT NULL,
    [Medicamento] NVARCHAR(100) NOT NULL,
    [Dosis] NVARCHAR(50) NOT NULL,
    [Frecuencia] NVARCHAR(50) NOT NULL,
    [Duracion] NVARCHAR(50) NOT NULL,
    [Cantidad] INT NOT NULL,
    [Indicaciones] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([RecetaID]) REFERENCES [dbo].[Recetas]([ID])
);

CREATE TABLE [dbo].[EntregasFarmacia] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [RecetaID] INT NOT NULL,
    [FechaEntrega] DATETIME2 NOT NULL,
    [EntregadoPorUsuarioID] INT NOT NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    [CostoTotal] DECIMAL(10,2) NOT NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([RecetaID]) REFERENCES [dbo].[Recetas]([ID]),
    FOREIGN KEY ([EntregadoPorUsuarioID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[CargosCuenta] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [FamiliarID] INT NOT NULL,
    [InternoID] INT NOT NULL,
    [AtencionMedicaID] INT NOT NULL,
    [Concepto] NVARCHAR(150) NOT NULL,
    [Monto] DECIMAL(10,2) NOT NULL,
    [FechaCargo] DATETIME2 NOT NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    [MontoOriginal] DECIMAL(10,2) NOT NULL,
    [PorcentajeDescuento] DECIMAL(5,2) NOT NULL,
    [FechaPago] DATETIME NULL,
    FOREIGN KEY ([FamiliarID]) REFERENCES [dbo].[Familiares]([ID]),
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID]),
    FOREIGN KEY ([AtencionMedicaID]) REFERENCES [dbo].[AtencionesMedicas]([ID])
);

CREATE TABLE [dbo].[CuotasMensuales] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [InternoID] INT NOT NULL,
    [PeriodoAnio] INT NOT NULL,
    [PeriodoMes] INT NOT NULL,
    [Monto] DECIMAL(10,2) NOT NULL,
    [FechaPago] DATE NULL,
    [MetodoPago] NVARCHAR(50) NULL,
    [NumeroReferencia] NVARCHAR(50) NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [Estado] NVARCHAR(50) NOT NULL,
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID])
);

CREATE TABLE [dbo].[Psicopatologias] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [InternoID] INT NOT NULL,
    [CondicionPadecimiento] NVARCHAR(255) NOT NULL,
    [Activa] BIT NOT NULL,
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID])
);

CREATE TABLE [dbo].[MedicamentosCajon] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [InternoID] INT NOT NULL,
    [Medicamento] NVARCHAR(100) NOT NULL,
    [Cantidad] NVARCHAR(50) NOT NULL,
    [Frecuencia] NVARCHAR(50) NOT NULL,
    [TiempoAplicacion] NVARCHAR(50) NOT NULL,
    [Activo] BIT NOT NULL,
    FOREIGN KEY ([InternoID]) REFERENCES [dbo].[Internos]([ID])
);

CREATE TABLE [dbo].[Donaciones] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [TipoDonante] NVARCHAR(50) NOT NULL,
    [NombreDonante] NVARCHAR(150) NOT NULL,
    [Telefono] NVARCHAR(20) NULL,
    [Correo] NVARCHAR(100) NULL,
    [Monto] DECIMAL(10,2) NOT NULL,
    [FormaRecepcion] NVARCHAR(50) NOT NULL,
    [FechaRecepcion] DATE NOT NULL,
    [NumeroReferencia] NVARCHAR(50) NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [RegistradoPorUsuarioID] INT NOT NULL,
    FOREIGN KEY ([RegistradoPorUsuarioID]) REFERENCES [dbo].[Usuarios]([Id])
);

CREATE TABLE [dbo].[GastosOperativos] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [TipoGasto] NVARCHAR(50) NOT NULL,
    [FechaGasto] DATE NOT NULL,
    [Monto] DECIMAL(10,2) NOT NULL,
    [ProveedorBeneficiario] NVARCHAR(150) NOT NULL,
    [Descripcion] NVARCHAR(MAX) NULL,
    [MetodoPago] NVARCHAR(50) NOT NULL,
    [NumeroReferencia] NVARCHAR(50) NULL,
    [Observaciones] NVARCHAR(MAX) NULL,
    [RegistradoPorUsuarioID] INT NOT NULL,
    FOREIGN KEY ([RegistradoPorUsuarioID]) REFERENCES [dbo].[Usuarios]([Id])
);
GO

-- ====================================================================
-- Inserción de Datos (Sin Duplicados en Roles, Usuarios, Familiares, Internos, Perfiles)
-- ====================================================================

SET IDENTITY_INSERT [dbo].[Roles] ON;
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (1, N'Administrador', N'Administra usuarios y configuración del sistema');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (3, N'MedicoGeneral', N'Realiza evaluaciones y crea solicitudes médicas');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (4, N'Enfermero', N'Acompaña a los internos durante la atención médica');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (5, N'Fundacion', N'Gestiona médicos especialistas y horarios de atención');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (6, N'MedicoEspecialista', N'Realiza consultas médicas especializadas');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (7, N'Laboratorio', N'Gestiona exámenes y resultados de laboratorio');
INSERT [dbo].[Roles] ([Id], [Nombre], [Descripcion]) VALUES (8, N'Farmacia', N'Gestiona medicamentos y despacho de recetas');
SET IDENTITY_INSERT [dbo].[Roles] OFF;
GO

SET IDENTITY_INSERT [dbo].[Usuarios] ON;
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (1, N'admin', N'admin@asilo.com', N'Admin123$', N'Carlos Méndez', 1, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (2, N'juanperez', N'juan@gmail.com', N'123456', N'Juan Pérez', 3, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (3, N'rperez', N'rperez@asilo.com', N'123455', N'Roberto Pérez Díaz', 5, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (4, N'jramirez', N'jramirez@asilo.com', N'223344', N'José Ramírez Soto', 6, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (5, N'cmendez', N'cmendez@asilo.com', N'123456', N'Carlos Méndez López', 3, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (6, N'acastillo', N'acastillo@asilo.com', N'123456', N'Andrea Castillo Pérez', 3, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (7, N'lmorales', N'lmorales@asilo.com', N'123456', N'Laura Morales Ruiz', 6, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (8, N'framirez', N'framirez@asilo.com', N'123456', N'Fernando Ramírez Soto', 6, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (9, N'alopez', N'alopez@asilo.com', N'123456', N'Ana López García', 4, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (10, N'mhernandez', N'mhernandez@asilo.com', N'123456', N'Miguel Hernández Díaz', 4, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (12, N'sherrera', N'sherrera@asilo.com', N'123456', N'Sofía Herrera Molina', 7, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (13, N'mtorres', N'mtorres@asilo.com', N'123456', N'María Torres Gómez', 8, 0);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (14, N'dperez', N'dperez@asilo.com', N'123456', N'Daniela Pérez Morales', 8, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (15, N'anasofia', N'anasofia@gmail.com', N'123456', N'Ana Sofía Martínez López', 6, 1);
INSERT [dbo].[Usuarios] ([Id], [NombreUsuario], [Correo], [PasswordHash], [NombreCompleto], [RolId], [Activo]) VALUES (16, N'krislopez', N'kristelnoj@gmail.com', N'kris19', N'Kristel Rishel Noj Lopez', 3, 0);
SET IDENTITY_INSERT [dbo].[Usuarios] OFF;
GO

SET IDENTITY_INSERT [dbo].[Familiares] ON;
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (1, N'María García', N'3344-6789', N'maria.lopez@gmail.com', N'Zona 1, Ciudad de Guatemala', N'hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (2, N'Elena Ramírez', N'55510001', N'elena.ramirez@gmail.com', N'Zona 1, Guatemala', N'Hija', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (3, N'Roberto Hernández', N'55510002', N'roberto.hernandez@gmail.com', N'Zona 5, Guatemala', N'Hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (4, N'Patricia Morales', N'55510003', N'patricia.morales@gmail.com', N'Zona 7, Guatemala', N'Hija', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (5, N'Carlos Castillo', N'55510004', N'carlos.castillo@gmail.com', N'Zona 12, Guatemala', N'hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (6, N'Lucía Fernández', N'55510005', N'lucia.fernandez@gmail.com', N'Zona 12, Guatemala', N'Hermana', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (7, N'Marta González', N'55510006', N'marta.gonzalez@gmail.com', N'Zona 18, Guatemala', N'Hija', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (8, N'Jorge Ramírez', N'55510007', N'jorge.ramirez@gmail.com', N'Zona 3, Guatemala', N'Hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (9, N'Sofía Martínez', N'55510008', N'sofia.martinez@gmail.com', N'Zona 6, Guatemala', N'Nieta', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (10, N'Fernando López', N'42215339', N'kristelnoj@gmail.com', N'Zona 10, Guatemala', N'hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (11, N'Claudia Pérez', N'55510010', N'claudia.perez@gmail.com', N'Zona 4, Guatemala', N'Hija', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (13, N'María Fernanda Méndez', N'5555-6789', N'maria.mendez@gmail.com', N'Zona 7, Ciudad de Guatemala', N'hijo', 1);
INSERT [dbo].[Familiares] ([ID], [NombreCompleto], [Telefono], [Correo], [Direccion], [Parentesco], [Activo]) VALUES (15, N'Andrea Castillo Pérez', N'5552-8641', N'andrea.castillo@gmail.com', N'Zona 18, Ciudad de Guatemala', N'hijo', 1);
SET IDENTITY_INSERT [dbo].[Familiares] OFF;
GO

SET IDENTITY_INSERT [dbo].[Internos] ON;
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (1, N'Carlos', N'García García', CAST(N'1950-03-15' AS Date), N'1234567890105', CAST(N'2026-09-22' AS Date), N'San Lucas Sacatepéquez, Guatemala', N'5555-4444', 1, 1, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (2, N'Elena', N'Ramírez', CAST(N'1945-03-12' AS Date), N'1001001000101', CAST(N'2026-01-15' AS Date), N'Zona 1, Guatemala', N'55510001', 2, 1, N'Femenino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (3, N'Antonio', N'Hernández', CAST(N'1942-07-24' AS Date), N'1001001000102', CAST(N'2026-02-03' AS Date), N'Zona 5, Guatemala', N'55510002', 3, 0, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (4, N'Marta', N'Morales', CAST(N'1948-11-08' AS Date), N'1001001000103', CAST(N'2026-02-18' AS Date), N'Zona 7, Guatemala', N'55510003', 4, 1, N'Femenino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (5, N'José', N'Castillo', CAST(N'1940-05-19' AS Date), N'1001001000104', CAST(N'2026-03-02' AS Date), N'Zona 11, Guatemala', N'55510004', 5, 1, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (6, N'Carmen', N'Fernández', CAST(N'1947-09-30' AS Date), N'1001001000105', CAST(N'2026-03-20' AS Date), N'Zona 12, Guatemala', N'55510005', 6, 1, N'Femenino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (7, N'Manuel', N'González', CAST(N'1939-12-15' AS Date), N'1001001000106', CAST(N'2026-04-05' AS Date), N'Zona 18, Guatemala', N'55510006', 7, 1, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (8, N'Rosa', N'Ramírez', CAST(N'1946-06-21' AS Date), N'1001001000107', CAST(N'2026-04-18' AS Date), N'Zona 3, Guatemala', N'55510007', 8, 1, N'Femenino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (9, N'Pedro', N'Martínez', CAST(N'1943-10-11' AS Date), N'1001001000108', CAST(N'2026-05-02' AS Date), N'Zona 6, Guatemala', N'55510008', 9, 1, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (10, N'Teresa', N'López', CAST(N'1950-01-27' AS Date), N'1001001000109', CAST(N'2026-05-15' AS Date), N'Zona 10, Guatemala', N'55510009', 10, 1, N'Femenino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (11, N'Miguel', N'Pérez', CAST(N'1941-08-06' AS Date), N'1001001000110', CAST(N'2026-06-01' AS Date), N'Zona 4, Guatemala', N'55510010', 11, 0, N'Masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (12, N'Andy', N'Lopez', CAST(N'1935-02-20' AS Date), N'123456789098', CAST(N'2026-09-24' AS Date), N'San Lucas Sacatepéquez, Guatemala', N'1234-5678', 10, 1, N'masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (15, N'Carlos Alberto', N'Méndez López', CAST(N'1945-03-15' AS Date), N'2456789010101', CAST(N'2026-10-11' AS Date), N'Zona 1, Ciudad de Guatemala', N'5555-1234', 13, 1, N'masculino');
INSERT [dbo].[Internos] ([ID], [Nombre], [Apellido], [FechaNacimiento], [DPI], [FechaIngreso], [DireccionAnterior], [TelefonoEmergencia], [FamiliarID], [Activo], [Genero]) VALUES (16, N'Roberto Enrique', N'Castillo Morales', CAST(N'1948-07-22' AS Date), N'2456789010101', CAST(N'2026-10-11' AS Date), N'Zona 6, Ciudad de Guatemala', N'5551-2468', 15, 1, N'masculino');
SET IDENTITY_INSERT [dbo].[Internos] OFF;
GO

SET IDENTITY_INSERT [dbo].[PerfilesUsuario] ON;
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (1, 2, N'MG-001', N'5555-4433', 1, 6);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (2, 3, N'FUND-001', N'5555-4433', 1, NULL);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (3, 4, N'ME-003', N'5555-4433', 1, 5);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (4, 5, N'MG-001', N'5555-1001', 1, 6);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (5, 6, N'MG-002', N'5555-1002', 1, 6);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (6, 7, N'ME-001', N'5555-1003', 1, 5);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (7, 8, N'ME-002', N'5555-1004', 1, 2);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (8, 9, N'ENF-001', N'5555-1005', 1, 3);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (9, 10, N'ENF-002', N'5555-1006', 1, 3);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (11, 12, N'LAB-002', N'5555-1008', 1, 1);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (12, 13, N'FAR-001', N'5555-1009', 1, 4);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (13, 14, N'FAR-002', N'5555-1010', 1, 4);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (14, 15, N'MED-2026-001', N'1234-5678', 1, 2);
INSERT [dbo].[PerfilesUsuario] ([ID], [UsuarioID], [NumeroColegiado], [Telefono], [Activo], [EspecialidadID]) VALUES (15, 16, N'1234', N'4221-8766', 1, NULL);
SET IDENTITY_INSERT [dbo].[PerfilesUsuario] OFF;
GO

-- ====================================================================
-- Inserción de Demás Tablas Transaccionales
-- ====================================================================

SET IDENTITY_INSERT [dbo].[EvaluacionesMedicas] ON;
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1, 2, 2, CAST(N'2026-09-25T20:43:58.5733906' AS DateTime2), N'Control médico rutinario', N'118/75', CAST(36.7 AS Decimal(4, 1)), 72, 98, N'Estado general estable', N'Recomendaciones generales de hidratación y alimentación', N'Paciente orientado, tranquilo y sin molestias actuales', 0);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (2, 9, 2, CAST(N'2026-09-25T20:48:53.9795598' AS DateTime2), N'Dolor persistente en rodilla derecha', N'122/78', CAST(36.8 AS Decimal(4, 1)), 80, 97, N'Dolor articular de rodilla derecha', N'Reposo relativo y seguimiento médico', N'Refiere dolor al caminar y dificultad para flexionar la rodilla', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (3, 9, 2, CAST(N'2026-09-27T20:02:39.8063110' AS DateTime2), N'Dolor persistente en rodilla derecha', N'122/78', CAST(36.8 AS Decimal(4, 1)), 80, 97, N'Dolor articular de rodilla derecha', N'Reposo relativo y seguimiento médico', N'Refiere dolor al caminar y dificultad para flexionar la rodilla', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (4, 4, 5, CAST(N'2026-09-30T14:32:35.6524546' AS DateTime2), N'Dificultad para respirar y cansancio al caminar', N'150/90', CAST(37.2 AS Decimal(4, 1)), 96, 92, N'Disnea de esfuerzo y posible descompensación cardiovascular', N'Reposo, controlar signos vitales y evitar esfuerzos físicos', N'Paciente refiere sensación de falta de aire desde hace 2 días. Se recomienda valoración especializada.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (5, 8, 5, CAST(N'2026-09-30T14:34:42.0998622' AS DateTime2), N'Dolor en rodilla y dificultad para caminar', N'135/82', CAST(36.8 AS Decimal(4, 1)), 78, 96, N'Dolor articular crónico con limitación de movilidad', N'Evitar esfuerzos, aplicar medidas locales según indicación y vigilar evolución', N'Dolor aumenta al levantarse y caminar. Presenta dificultad para movilizarse sin apoyo.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (6, 6, 6, CAST(N'2026-09-30T14:37:43.9015535' AS DateTime2), N'Mareos frecuentes y sensación de palpitaciones', N'145/88', CAST(36.9 AS Decimal(4, 1)), 108, 94, N'Taquicardia y episodios recurrentes de mareo', N'Reposo, mantener hidratación y controlar frecuencia cardiaca', N'Se han presentado varios episodios durante la última semana. Se solicita valoración para descartar alteración cardíaca.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (7, 7, 6, CAST(N'2026-09-30T14:39:35.9852462' AS DateTime2), N'Pérdida de memoria reciente y desorientación ocasional', N'128/76', CAST(36.7 AS Decimal(4, 1)), 74, 97, N'Alteración cognitiva de evolución progresiva', N'Mantener supervisión, registrar episodios de desorientación y acompañamiento durante actividades', N'Refiere que el paciente ha olvidado actividades recientes y ocasionalmente confunde horarios.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (8, 10, 2, CAST(N'2026-09-30T18:25:09.3328625' AS DateTime2), N'Dificultad para respirar y cansancio al caminar', N'150/90', CAST(37.2 AS Decimal(4, 1)), 96, 92, N'Disnea de esfuerzo y posible descompensación cardiovascular', N'Reposo, controlar signos vitales y evitar esfuerzos físicos', N'Paciente refiere sensación de falta de aire desde hace 2 días. Se recomienda valoración especializada', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (9, 12, 2, CAST(N'2026-09-30T18:26:40.8977086' AS DateTime2), N'Pérdida de memoria reciente y desorientación ocasional', N'128/76', CAST(36.7 AS Decimal(4, 1)), 74, 52, N'Alteración cognitiva de evolución progresiva', N'Mantener supervisión, registrar episodios de desorientación y acompañamiento durante actividades', N'el paciente ha olvidado actividades recientes y ocasionalmente confunde horarios.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (10, 8, 5, CAST(N'2026-10-01T12:04:48.6218761' AS DateTime2), N'Dificultad para respirar y cansancio al caminar.', N'150/90', CAST(37.2 AS Decimal(4, 1)), 96, 92, N'Disnea de esfuerzo y posible descompensación cardiovascular', N'Reposo, controlar signos vitales y evitar esfuerzos físicos', N'Paciente refiere sensación de falta de aire desde hace 2 días. Se recomienda valoración especializada.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (11, 12, 5, CAST(N'2026-10-01T12:06:00.7608660' AS DateTime2), N'Dolor en rodilla y dificultad para caminar', N'135/82', CAST(36.8 AS Decimal(4, 1)), 78, 96, N'Dolor articular crónico con limitación de movilidad', N'Evitar esfuerzos, aplicar medidas locales según indicación y vigilar evolución', N'Dolor aumenta al levantarse y caminar. Presenta dificultad para movilizarse sin apoyo.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (12, 5, 5, CAST(N'2026-10-01T12:07:17.4816532' AS DateTime2), N'Mareos frecuentes y sensación de palpitaciones', N'145/88', CAST(33.8 AS Decimal(4, 1)), 108, 94, N'Taquicardia y episodios recurrentes de mareo', N'Reposo, mantener hidratación y controlar frecuencia cardiaca', N'Se han presentado varios episodios durante la última semana. Se solicita valoración para descartar alteración cardíaca.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (13, 2, 2, CAST(N'2026-10-01T15:23:35.7007083' AS DateTime2), N'Dificultad para respirar y cansancio al caminar', N'150/90', CAST(37.2 AS Decimal(4, 1)), 96, 74, N'Disnea de esfuerzo y posible descompensación cardiovascular', N'Reposo, controlar signos vitales y evitar esfuerzos físicos', N'Paciente refiere sensación de falta de aire desde hace 2 días. Se recomienda valoración especializada.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (14, 1, 2, CAST(N'2026-10-01T15:24:49.2684228' AS DateTime2), N'Dolor en rodilla y dificultad para caminar', N'132/82', CAST(36.8 AS Decimal(4, 1)), 78, 96, N'Dolor articular crónico con limitación de movilidad', N'Evitar esfuerzos, aplicar medidas locales según indicación y vigilar evolución', N'Dolor aumenta al levantarse y caminar. Presenta dificultad para movilizarse sin apoyo.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (15, 4, 2, CAST(N'2026-10-01T15:26:41.1934429' AS DateTime2), N'Mareos frecuentes y sensación de palpitaciones', N'145/88', CAST(36.9 AS Decimal(4, 1)), 108, 94, N'Taquicardia y episodios recurrentes de mareo', N'Reposo, mantener hidratación y controlar frecuencia cardiaca', N'Se han presentado varios episodios durante la última semana. Se solicita valoración para descartar alteración cardíaca.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (16, 6, 2, CAST(N'2026-10-01T15:30:57.2151605' AS DateTime2), N'Pérdida de memoria reciente y desorientación ocasional', N'128/76', CAST(36.7 AS Decimal(4, 1)), 74, 67, N'Alteración cognitiva de evolución progresiva', N'Mantener supervisión, registrar episodios de desorientación y acompañamiento durante actividades', N'Familiar refiere que el paciente ha olvidado actividades recientes y ocasionalmente confunde horarios.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (17, 5, 6, CAST(N'2026-10-05T01:25:25.8378772' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 60, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1017, 10, 2, CAST(N'2026-10-05T15:45:02.9958531' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1018, 10, 2, CAST(N'2026-10-05T15:45:05.9032840' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1019, 10, 2, CAST(N'2026-10-05T15:45:08.9901679' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1020, 12, 2, CAST(N'2026-10-05T15:54:10.3232886' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1021, 12, 2, CAST(N'2026-10-05T15:54:12.4150413' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1022, 12, 2, CAST(N'2026-10-05T16:05:20.5179977' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.8 AS Decimal(4, 1)), 96, 94, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1023, 12, 5, CAST(N'2026-10-06T21:52:40.4202064' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.5 AS Decimal(4, 1)), 98, 96, N'Dolor torácico y disnea de esfuerzo. Se requiere valoración por Cardiología para descartar alteración cardiovascular.', N'Mantener reposo relativo, evitar esfuerzos físicos y permanecer bajo observación. Se solicita valoración por médico especialista en Cardiología para realizar estudios complementarios.', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista en Cardiología.', 1);
INSERT [dbo].[EvaluacionesMedicas] ([ID], [InternoID], [MedicoGeneralID], [FechaEvaluacion], [MotivoConsulta], [PresionArterial], [Temperatura], [FrecuenciaCardiaca], [SaturacionOxigeno], [Diagnostico], [Tratamiento], [Observaciones], [RequiereEspecialista]) VALUES (1024, 12, 5, CAST(N'2026-10-06T22:06:27.2965510' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'145/90', CAST(36.6 AS Decimal(4, 1)), 98, 96, N'Dolor torácico y disnea de esfuerzo.', N'Completada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados.', 1);
SET IDENTITY_INSERT [dbo].[EvaluacionesMedicas] OFF;
GO

SET IDENTITY_INSERT [dbo].[Citas] ON;
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1013, 1021, 12, 15, CAST(N'2026-10-06T14:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1014, 1018, 10, 15, CAST(N'2026-10-06T08:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1015, 1019, 12, 15, CAST(N'2026-10-06T10:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1016, 13, 1, 4, CAST(N'2026-10-06T09:00:00.0000000' AS DateTime2), N'Dolor en rodilla y dificultad para caminar', N'Programada', N'Dolor aumenta al levantarse y caminar. Presenta dificultad para movilizarse sin apoyo.');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1017, 1017, 10, 15, CAST(N'2026-10-06T09:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1018, 1016, 10, 8, CAST(N'2026-10-28T11:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1019, 1020, 12, 8, CAST(N'2026-10-06T11:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Pendiente', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista');
INSERT [dbo].[Citas] ([ID], [SolicitudID], [InternoID], [EspecialistaID], [FechaHora], [Motivo], [Estado], [Observaciones]) VALUES (1020, 1023, 12, 15, CAST(N'2026-10-12T10:00:00.0000000' AS DateTime2), N'Dolor en el pecho y sensación de falta de aire al realizar actividades físicas.', N'Programada', N'El interno refiere episodios de dolor en el pecho acompañados de falta de aire al caminar. Debido a los síntomas y a los signos vitales registrados, se considera necesaria la valoración por un especialista en Cardiología.');
SET IDENTITY_INSERT [dbo].[Citas] OFF;
GO

SET IDENTITY_INSERT [dbo].[AtencionesMedicas] ON;
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (4, 1, CAST(N'2026-09-30T01:01:53.3135997' AS DateTime2), N'Inflamación de rodilla derecha', NULL, N'Se recomienda reposo y evitar esfuerzos físicos', N'Completada', CAST(150.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (5, 3, CAST(N'2026-09-30T15:14:59.1292105' AS DateTime2), N'Gonartrosis (artrosis de rodilla) con limitación funcional.', NULL, N'Se recomienda evitar esfuerzos y actividades que aumenten el dolor. Mantener apoyo para caminar y continuar vigilancia de movilidad.', N'Pendiente resultados', CAST(300.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (6, 2, CAST(N'2026-09-30T16:59:12.9089450' AS DateTime2), N'Taquicardia sinusal con episodios de palpitaciones y mareo.', NULL, N'Se recomienda vigilancia de frecuencia cardíaca. Si presenta dolor intenso en el pecho, dificultad respiratoria o pérdida del conocimiento, acudir inmediatamente a evaluación médica.', N'Pendiente resultados', CAST(400.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (7, 4, CAST(N'2026-09-30T18:06:46.2179509' AS DateTime2), N'Deterioro cognitivo leve en estudio.', NULL, NULL, N'Pendiente resultados', CAST(325.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (8, 5, CAST(N'2026-09-30T18:14:19.9695372' AS DateTime2), N'Hipertensión arterial con signos de posible insuficiencia cardíaca leve.', NULL, N'Paciente presenta disnea de esfuerzo y saturación de oxígeno de 92%. Se recomienda vigilancia de signos vitales y reevaluación posterior al tratamiento.', N'Completada', CAST(350.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (9, 6, CAST(N'2026-09-30T18:31:56.2280545' AS DateTime2), N'Hipertensión arterial con signos de posible insuficiencia cardíaca leve.', N'Hallazgos electrocardiográficos compatibles con sobrecarga ventricular izquierda, con ritmo sinusal regular a 94 lpm y sin alteraciones agudas del segmento ST. Se recomienda correlacionar los resultados con la evaluación clínica y completar los estudios cardiológicos correspondientes para confirmar la causa de los síntomas y determinar su relevancia clínica.', N'Paciente presenta disnea de esfuerzo y saturación de oxígeno de 92%. Se recomienda vigilancia de signos vitales y reevaluación posterior al tratamiento.', N'Completada', CAST(350.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (10, 9, CAST(N'2026-10-01T12:14:10.1763699' AS DateTime2), N'Gonartrosis (artrosis de rodilla) con limitación funcional.', NULL, N'Se recomienda evitar esfuerzos y actividades que aumenten el dolor. Mantener apoyo para caminar y continuar vigilancia de movilidad.', N'Pendiente', CAST(300.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (11, 7, CAST(N'2026-10-01T12:15:27.7405882' AS DateTime2), N'Deterioro cognitivo leve en estudio.', N'Deterioro cognitivo leve, sin alteraciones metabólicas significativas en los estudios de laboratorio.', NULL, N'Completada', CAST(325.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (12, 12, CAST(N'2026-10-01T15:36:32.8251103' AS DateTime2), N'Deterioro cognitivo leve en estudio.', NULL, N'Se recomienda seguimiento geriátrico y evaluación periódica de la función cognitiva. Se solicita información de familiares y cuidadores sobre cambios recientes en el comportamiento.', N'Pendiente', CAST(300.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (13, 11, CAST(N'2026-10-01T16:15:09.6721765' AS DateTime2), N'Hipertensión arterial con signos de posible insuficiencia cardíaca leve.', NULL, N'Paciente presenta disnea de esfuerzo y saturación de oxígeno de 92%. Se recomienda vigilancia de signos vitales y reevaluación posterior al tratamiento.', N'Pendiente', CAST(250.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (14, 10, CAST(N'2026-10-01T16:25:05.4953089' AS DateTime2), N'Hipertensión arterial con signos de posible insuficiencia cardíaca leve.', NULL, NULL, N'Pendiente', CAST(250.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (15, 13, CAST(N'2026-10-05T01:42:18.2880294' AS DateTime2), N'Hipertensión arterial con signos de posible insuficiencia cardíaca leve.', N'Hipertensión arterial con signos de sobrecarga ventricular izquierda, asociada a disnea de esfuerzo.', NULL, N'Completada', CAST(350.00 AS Decimal(10, 2)));
INSERT [dbo].[AtencionesMedicas] ([ID], [CitaID], [FechaAtencion], [Diagnostico], [DiagnosticoFinal], [Observaciones], [Estado], [CostoConsulta]) VALUES (1015, 1019, CAST(N'2026-10-11T22:13:17.4870342' AS DateTime2), N'Diagnóstico registrado por el especialista durante la atención, separado del motivo o diagnóstico de la solicitud inicial. Dolor torácico y disnea de esfuerzo en estudio.', NULL, N'Paciente refiere dolor en el pecho y sensación de falta de aire al realizar actividades físicas. Se recomienda completar la evaluación cardiológica, realizar los exámenes complementarios correspondientes y mantener vigilancia de los síntomas.', N'Pendiente resultados', CAST(250.00 AS Decimal(10, 2)));
SET IDENTITY_INSERT [dbo].[AtencionesMedicas] OFF;
GO

SET IDENTITY_INSERT [dbo].[ExamenesLaboratorio] ON;
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (4, 9, N'Electrocardiograma (ECG)', N'Realizar en reposo para evaluar ritmo cardíaco y descartar alteraciones cardiovasculares.', CAST(N'2026-09-30T18:31:56.3157632' AS DateTime2), CAST(N'2026-10-01T01:08:57.7531806' AS DateTime2), N'Completado', CAST(150.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (5, 10, N'Radiografía de rodilla', N'Realizar radiografía de rodilla afectada en proyecciones frontal y lateral.', CAST(N'2026-10-01T12:14:10.3667861' AS DateTime2), CAST(N'2026-10-01T12:28:10.9151036' AS DateTime2), N'Completado', CAST(400.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (6, 11, N'Evaluación cognitiva y pruebas de laboratorio básicas.', N'Realizar evaluación de memoria, orientación y funciones cognitivas. Complementar con pruebas para descartar causas metabólicas.', CAST(N'2026-10-01T12:15:27.7570671' AS DateTime2), CAST(N'2026-10-01T12:16:48.2617068' AS DateTime2), N'Completado', CAST(400.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (7, 12, N'Evaluación cognitiva y pruebas de laboratorio básicas.', N'Realizar evaluación de memoria, orientación y funciones cognitivas. Complementar con pruebas para descartar causas metabólicas.', CAST(N'2026-10-01T15:36:32.9093848' AS DateTime2), CAST(N'2026-10-01T15:39:26.1224872' AS DateTime2), N'Completado', CAST(500.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (8, 13, N'Electrocardiograma (ECG)', N'Realizar en reposo para evaluar ritmo cardíaco y descartar alteraciones cardiovasculares.', CAST(N'2026-10-01T16:15:09.8854840' AS DateTime2), CAST(N'2026-10-11T16:54:04.3826755' AS DateTime2), N'Completado', CAST(250.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (9, 14, N'Electrocardiograma (ECG)', N'Realizar en reposo para evaluar ritmo cardíaco y descartar alteraciones cardiovasculares.', CAST(N'2026-10-01T16:25:05.5135919' AS DateTime2), CAST(N'2026-10-11T22:22:55.7877086' AS DateTime2), N'Completado', CAST(150.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (10, 15, N'Electrocardiograma (ECG)', N'Realizar electrocardiograma en reposo para evaluar ritmo cardíaco y posibles alteraciones cardiovasculares.', CAST(N'2026-10-05T01:42:18.6432233' AS DateTime2), CAST(N'2026-10-05T01:43:50.7609858' AS DateTime2), N'Completado', CAST(150.00 AS Decimal(10, 2)));
INSERT [dbo].[ExamenesLaboratorio] ([ID], [AtencionMedicaID], [TipoExamen], [Indicaciones], [FechaSolicitud], [FechaTomaMuestra], [Estado], [Costo]) VALUES (11, 1015, N'Electrocardiograma (ECG)', N'Evaluar la actividad eléctrica del corazón como parte de la valoración cardiológica.', CAST(N'2026-10-11T22:13:17.6308457' AS DateTime2), NULL, N'Pendiente', NULL);
SET IDENTITY_INSERT [dbo].[ExamenesLaboratorio] OFF;
GO

SET IDENTITY_INSERT [dbo].[Recetas] ON;
INSERT [dbo].[Recetas] ([ID], [AtencionMedicaID], [FechaReceta], [Estado]) VALUES (1, 8, CAST(N'2026-09-30T18:14:19.9933341' AS DateTime2), N'Entregada');
INSERT [dbo].[Recetas] ([ID], [AtencionMedicaID], [FechaReceta], [Estado]) VALUES (2, 9, CAST(N'2026-09-30T18:31:56.3458984' AS DateTime2), N'Pendiente');
INSERT [dbo].[Recetas] ([ID], [AtencionMedicaID], [FechaReceta], [Estado]) VALUES (3, 10, CAST(N'2026-10-01T12:14:10.4582242' AS DateTime2), N'Entregada');
INSERT [dbo].[Recetas] ([ID], [AtencionMedicaID], [FechaReceta], [Estado]) VALUES (4, 13, CAST(N'2026-10-01T16:15:09.9198594' AS DateTime2), N'Entregada');
INSERT [dbo].[Recetas] ([ID], [AtencionMedicaID], [FechaReceta], [Estado]) VALUES (5, 15, CAST(N'2026-10-05T01:42:18.7033363' AS DateTime2), N'Entregada');
SET IDENTITY_INSERT [dbo].[Recetas] OFF;
GO

SET IDENTITY_INSERT [dbo].[CargosCuenta] ON;
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (3, 9, 9, 4, N'Consulta médica', CAST(135.00 AS Decimal(10, 2)), CAST(N'2026-09-30T01:01:53.4106321' AS DateTime2), N'Pendiente', CAST(150.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (4, 8, 8, 5, N'Consulta médica', CAST(270.00 AS Decimal(10, 2)), CAST(N'2026-09-30T15:14:59.1583829' AS DateTime2), N'Pendiente', CAST(300.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (5, 6, 6, 6, N'Consulta médica', CAST(360.00 AS Decimal(10, 2)), CAST(N'2026-09-30T16:59:13.0163472' AS DateTime2), N'Pendiente', CAST(400.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (6, 7, 7, 7, N'Consulta médica', CAST(292.50 AS Decimal(10, 2)), CAST(N'2026-09-30T18:06:46.2462003' AS DateTime2), N'Pendiente', CAST(325.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (7, 4, 4, 8, N'Consulta médica', CAST(315.00 AS Decimal(10, 2)), CAST(N'2026-09-30T18:14:19.9722058' AS DateTime2), N'Pendiente', CAST(350.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (8, 10, 10, 9, N'Consulta médica', CAST(450.00 AS Decimal(10, 2)), CAST(N'2026-09-30T18:31:56.2497449' AS DateTime2), N'Pendiente', CAST(500.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (9, 10, 12, 10, N'Consulta médica', CAST(684.00 AS Decimal(10, 2)), CAST(N'2026-10-01T12:14:10.2660848' AS DateTime2), N'Pendiente', CAST(760.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (10, 10, 12, 11, N'Consulta médica', CAST(292.50 AS Decimal(10, 2)), CAST(N'2026-10-01T12:15:27.7432152' AS DateTime2), N'Pendiente', CAST(325.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (11, 6, 6, 12, N'Consulta médica', CAST(270.00 AS Decimal(10, 2)), CAST(N'2026-10-01T15:36:32.8431208' AS DateTime2), N'Pendiente', CAST(300.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (12, 2, 2, 13, N'Consulta médica', CAST(585.00 AS Decimal(10, 2)), CAST(N'2026-10-01T16:15:09.7717474' AS DateTime2), N'Pagado', CAST(650.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), CAST(N'2026-10-07T01:22:06.753' AS DateTime));
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (13, 8, 8, 14, N'Consulta médica', CAST(360.00 AS Decimal(10, 2)), CAST(N'2026-10-01T16:25:05.5022324' AS DateTime2), N'Pendiente', CAST(400.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (14, 5, 5, 15, N'Servicios médicos', CAST(481.50 AS Decimal(10, 2)), CAST(N'2026-10-05T01:42:18.4988936' AS DateTime2), N'Pagado', CAST(535.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
INSERT [dbo].[CargosCuenta] ([ID], [FamiliarID], [InternoID], [AtencionMedicaID], [Concepto], [Monto], [FechaCargo], [Estado], [MontoOriginal], [PorcentajeDescuento], [FechaPago]) VALUES (15, 10, 12, 1015, N'Servicios médicos', CAST(225.00 AS Decimal(10, 2)), CAST(N'2026-10-11T22:13:17.5788067' AS DateTime2), N'Pendiente', CAST(250.00 AS Decimal(10, 2)), CAST(10.00 AS Decimal(5, 2)), NULL);
SET IDENTITY_INSERT [dbo].[CargosCuenta] OFF;
GO

SET IDENTITY_INSERT [dbo].[ResultadosLaboratorio] ON;
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (1, 4, CAST(N'2026-10-01T03:31:08.7832853' AS DateTime2), N'Ritmo sinusal regular a 94 lpm. Intervalo PR dentro de límites normales. Complejo QRS de duración normal. Se observan signos compatibles con sobrecarga ventricular izquierda. No se identifican alteraciones agudas del segmento ST. Se recomienda correlacionar los hallazgos con la evaluación clínica del paciente.', N'Electrocardiograma realizado en reposo sin complicaciones durante el procedimiento. Se identifican cambios compatibles con sobrecarga ventricular izquierda. Se recomienda valoración y seguimiento por Cardiología de acuerdo con los hallazgos clínicos.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (2, 6, CAST(N'2026-10-01T12:18:45.3783347' AS DateTime2), N'Hemograma completo dentro de parámetros generales. Glucosa en sangre dentro de rango esperado. Función renal sin alteraciones significativas. Niveles de vitamina B12 y ácido fólico dentro de valores de referencia. No se identifican alteraciones metabólicas evidentes que expliquen por sí solas los episodios de desorientación.', N'Muestras procesadas correctamente y sin incidencias durante el procedimiento. Los resultados obtenidos no presentan alteraciones significativas. Se recomienda correlacionar los resultados con la evaluación clínica y cognitiva realizada por el especialista.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (3, 5, CAST(N'2026-10-01T12:28:50.6017238' AS DateTime2), N'Radiografía de rodilla en proyecciones frontal y lateral. Se observa disminución del espacio articular femorotibial, presencia de pequeños osteofitos marginales y cambios degenerativos leves. No se observan fracturas ni lesiones óseas agudas.', N'Estudio realizado sin complicaciones. Los hallazgos radiográficos son compatibles con cambios degenerativos de la articulación. Se recomienda correlacionar los resultados con la evaluación clínica del paciente.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (4, 7, CAST(N'2026-10-01T15:39:49.5195323' AS DateTime2), N'Hemograma completo dentro de parámetros generales. Glucosa en sangre dentro de rango esperado. Función renal sin alteraciones significativas. Niveles de vitamina B12 y ácido fólico dentro de valores de referencia. No se identifican alteraciones metabólicas evidentes que expliquen por sí solas los episodios de desorientación.', N'Muestras procesadas correctamente y sin incidencias durante el procedimiento. Los resultados obtenidos no presentan alteraciones significativas. Se recomienda correlacionar los resultados con la evaluación clínica y cognitiva realizada por el especialista.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (5, 10, CAST(N'2026-10-05T01:44:12.9073307' AS DateTime2), N'Ritmo sinusal regular a 94 lpm. Se observan signos compatibles con sobrecarga ventricular izquierda. No se identifican alteraciones agudas del segmento ST.', N'Electrocardiograma realizado en reposo sin complicaciones durante el procedimiento. Los resultados fueron entregados para valoración del médico especialista.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (1005, 8, CAST(N'2026-10-11T22:24:25.6205476' AS DateTime2), N'Electrocardiograma realizado en reposo. Se registra ritmo sinusal regular a 88 lpm, con intervalo PR y complejo QRS dentro de límites normales. No se observan alteraciones agudas evidentes del segmento ST en el registro. Se recomienda correlacionar los hallazgos con la evaluación clínica de la paciente.', N'El examen se realizó en reposo y sin complicaciones durante el procedimiento. El registro obtenido es apto para su revisión por el médico tratante. Se recomienda valoración e interpretación por Cardiología, considerando los síntomas y antecedentes clínicos de la paciente.', NULL);
INSERT [dbo].[ResultadosLaboratorio] ([ID], [ExamenLaboratorioID], [FechaResultado], [Resultado], [Observaciones], [RegistradoPorUsuarioID]) VALUES (1006, 9, CAST(N'2026-10-11T22:24:43.6388620' AS DateTime2), N'Electrocardiograma realizado en reposo. Se registra ritmo sinusal regular a 88 lpm, con intervalo PR y complejo QRS dentro de límites normales. No se observan alteraciones agudas evidentes del segmento ST en el registro. Se recomienda correlacionar los hallazgos con la evaluación clínica de la paciente.', N'El examen se realizó en reposo y sin complicaciones durante el procedimiento. El registro obtenido es apto para su revisión por el médico tratante. Se recomienda valoración e interpretación por Cardiología, considerando los síntomas y antecedentes clínicos de la paciente.', NULL);
SET IDENTITY_INSERT [dbo].[ResultadosLaboratorio] OFF;
GO

SET IDENTITY_INSERT [dbo].[DetalleReceta] ON;
INSERT [dbo].[DetalleReceta] ([ID], [RecetaID], [Medicamento], [Dosis], [Frecuencia], [Duracion], [Cantidad], [Indicaciones]) VALUES (1, 1, N'Furosemida', N'20', N'cada 24 horas', N'5 días', 5, N'Tomar por la mañana y mantener adecuada hidratación según indicación médica');
INSERT [dbo].[DetalleReceta] ([ID], [RecetaID], [Medicamento], [Dosis], [Frecuencia], [Duracion], [Cantidad], [Indicaciones]) VALUES (2, 2, N'Furosemida', N'20 mg', N'cada 24 horas', N'5 días', 5, N'Tomar por la mañana y mantener adecuada hidratación según indicación médica.');
INSERT [dbo].[DetalleReceta] ([ID], [RecetaID], [Medicamento], [Dosis], [Frecuencia], [Duracion], [Cantidad], [Indicaciones]) VALUES (3, 3, N'Paracetamol', N'500 mg', N'Cada 8 horas según dolor', N'7 días', 21, N'Tomar después de los alimentos cuando presente dolor. No exceder la dosis indicada.');
INSERT [dbo].[DetalleReceta] ([ID], [RecetaID], [Medicamento], [Dosis], [Frecuencia], [Duracion], [Cantidad], [Indicaciones]) VALUES (4, 4, N'Furosemida', N'20 mg', N'Cada 24 horas', N'5 días', 5, N'Tomar por la mañana y mantener adecuada hidratación según indicación médica.');
INSERT [dbo].[DetalleReceta] ([ID], [RecetaID], [Medicamento], [Dosis], [Frecuencia], [Duracion], [Cantidad], [Indicaciones]) VALUES (5, 5, N'Furosemida', N'20  mg', N'Cada 24 horas', N'5 días', 5, N'Tomar por la mañana y mantener adecuada hidratación según indicación médica.');
SET IDENTITY_INSERT [dbo].[DetalleReceta] OFF;
GO

SET IDENTITY_INSERT [dbo].[EntregasFarmacia] ON;
INSERT [dbo].[EntregasFarmacia] ([ID], [RecetaID], [FechaEntrega], [EntregadoPorUsuarioID], [Estado], [CostoTotal], [Observaciones]) VALUES (1, 4, CAST(N'2026-10-02T15:58:02.3418799' AS DateTime2), 14, N'Completado', CAST(150.00 AS Decimal(10, 2)), N'Se verificó dosis, frecuencia y duración indicadas por el médico. Se brindaron indicaciones al paciente sobre la administración por la mañana y se recomendó mantener adecuada hidratación. Sin incidencias al momento de la entrega.');
INSERT [dbo].[EntregasFarmacia] ([ID], [RecetaID], [FechaEntrega], [EntregadoPorUsuarioID], [Estado], [CostoTotal], [Observaciones]) VALUES (2, 1, CAST(N'2026-10-02T16:09:14.6313456' AS DateTime2), 14, N'Completado', CAST(140.00 AS Decimal(10, 2)), N'');
INSERT [dbo].[EntregasFarmacia] ([ID], [RecetaID], [FechaEntrega], [EntregadoPorUsuarioID], [Estado], [CostoTotal], [Observaciones]) VALUES (3, 5, CAST(N'2026-10-05T01:46:21.5604004' AS DateTime2), 14, N'Completado', CAST(35.00 AS Decimal(10, 2)), N'Medicamento dispensado correctamente de acuerdo con la receta médica. Se verificó la dosis, frecuencia y duración del tratamiento. Se brindaron indicaciones sobre la administración por la mañana y se recomendó mantener adecuada hidratación.');
INSERT [dbo].[EntregasFarmacia] ([ID], [RecetaID], [FechaEntrega], [EntregadoPorUsuarioID], [Estado], [CostoTotal], [Observaciones]) VALUES (4, 3, CAST(N'2026-10-11T22:27:01.6441498' AS DateTime2), 14, N'Completado', CAST(60.00 AS Decimal(10, 2)), N'');
SET IDENTITY_INSERT [dbo].[EntregasFarmacia] OFF;
GO

SET IDENTITY_INSERT [dbo].[Donaciones] ON;
INSERT [dbo].[Donaciones] ([ID], [TipoDonante], [NombreDonante], [Telefono], [Correo], [Monto], [FormaRecepcion], [FechaRecepcion], [NumeroReferencia], [Observaciones], [RegistradoPorUsuarioID]) VALUES (1, N'persona-particular', N'Juan Pérez', N'1111-2222', N'juan@gmail.com', CAST(500.00 AS Decimal(10, 2)), N'efectivo', CAST(N'2026-09-22' AS Date), N'', N'Donación mensual', 1);
SET IDENTITY_INSERT [dbo].[Donaciones] OFF;
GO

SET IDENTITY_INSERT [dbo].[GastosOperativos] ON;
INSERT [dbo].[GastosOperativos] ([ID], [TipoGasto], [FechaGasto], [Monto], [ProveedorBeneficiario], [Descripcion], [MetodoPago], [NumeroReferencia], [Observaciones], [RegistradoPorUsuarioID]) VALUES (1, N'alimentacion', CAST(N'2026-09-23' AS Date), CAST(250.00 AS Decimal(10, 2)), N'Supermercado La Torre', N'Compra de alimentos para los internos', N'transferencia', N'TRANS-001', N'Compra semanal', 1);
SET IDENTITY_INSERT [dbo].[GastosOperativos] OFF;
GO

SET IDENTITY_INSERT [dbo].[CuotasMensuales] ON;
INSERT [dbo].[CuotasMensuales] ([ID], [InternoID], [PeriodoAnio], [PeriodoMes], [Monto], [FechaPago], [MetodoPago], [NumeroReferencia], [Observaciones], [Estado]) VALUES (1, 1, 2026, 9, CAST(500.00 AS Decimal(10, 2)), CAST(N'2026-09-23' AS Date), N'transferencia', N'TRANS-003', N'Pago mensual', N'Pagado');
INSERT [dbo].[CuotasMensuales] ([ID], [InternoID], [PeriodoAnio], [PeriodoMes], [Monto], [FechaPago], [MetodoPago], [NumeroReferencia], [Observaciones], [Estado]) VALUES (2, 5, 2026, 9, CAST(450.00 AS Decimal(10, 2)), CAST(N'2026-10-05' AS Date), N'efectivo', N'', N'', N'Pagado');
SET IDENTITY_INSERT [dbo].[CuotasMensuales] OFF;
GO

SET IDENTITY_INSERT [dbo].[Psicopatologias] ON;
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (1, 1, N'Hipertensión arterial', 1);
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (2, 2, N'Deterioro cognitivo leve', 1);
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (3, 3, N'Hipertensión y ansiedad', 1);
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (4, 4, N'Demencia senil', 1);
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (5, 6, N'Depresión', 1);
INSERT [dbo].[Psicopatologias] ([ID], [InternoID], [CondicionPadecimiento], [Activa]) VALUES (6, 9, N'Deterioro cognitivo moderado', 1);
SET IDENTITY_INSERT [dbo].[Psicopatologias] OFF;
GO

SET IDENTITY_INSERT [dbo].[MedicamentosCajon] ON;
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (1, 1, N'Losartán', N'30 tabletas', N'cada 24 horas', N'30 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (2, 1, N'Paracetamol', N'20 tabletas', N'cada 8 horas', N'5 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (3, 2, N'Paracetamol', N'20 tabletas', N'Cada 8 horas', N'5 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (4, 3, N'Losartán', N'30 tabletas', N'Una vez al día', N'30 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (5, 4, N'Metformina', N'30 tabletas', N'Cada 12 horas', N'30 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (6, 6, N'Paracetamol', N'15 tabletas', N'Cada 8 horas', N'5 días', 1);
INSERT [dbo].[MedicamentosCajon] ([ID], [InternoID], [Medicamento], [Cantidad], [Frecuencia], [TiempoAplicacion], [Activo]) VALUES (7, 9, N'Donepezilo', N'30 tabletas', N'Una vez al día', N'30 días', 1);
SET IDENTITY_INSERT [dbo].[MedicamentosCajon] OFF;
GO