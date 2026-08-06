FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Booking.sln", "."]
COPY ["src/Booking.Domain/Booking.Domain.csproj", "src/Booking.Domain/"]
COPY ["src/Booking.Application/Booking.Application.csproj", "src/Booking.Application/"]
COPY ["src/Booking.Infrastructure/Booking.Infrastructure.csproj", "src/Booking.Infrastructure/"]
COPY ["src/Booking.Api/Booking.Api.csproj", "src/Booking.Api/"]
RUN dotnet restore "Booking.sln"

COPY . .
WORKDIR "/src/src/Booking.Api"
RUN dotnet build "Booking.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Booking.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Booking.Api.dll"]