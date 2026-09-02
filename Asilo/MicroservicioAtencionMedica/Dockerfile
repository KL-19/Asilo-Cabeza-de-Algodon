FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["MicroservicioAtencionMedica.csproj", "."]
RUN dotnet restore "MicroservicioAtencionMedica.csproj"
COPY . .
RUN dotnet publish "MicroservicioAtencionMedica.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 8080
ENTRYPOINT ["dotnet", "MicroservicioAtencionMedica.dll"]