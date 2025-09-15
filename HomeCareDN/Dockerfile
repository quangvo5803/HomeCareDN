# ========================
# Stage 1: Build .NET API
# ========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first (for cache)
COPY *.sln ./
COPY HomeCareDNAPI/*.csproj HomeCareDNAPI/
COPY BusinessLogic/*.csproj BusinessLogic/
COPY DataAccess/*.csproj DataAccess/
COPY Ultitity/*.csproj Ultitity/

# Restore dependencies
RUN dotnet restore HomeCareDN.sln

# Copy the rest of the source
COPY . .

# Publish the API
RUN dotnet publish HomeCareDNAPI/HomeCareDNAPI.csproj -c Release -o /app --no-restore

# ========================
# Stage 2: Runtime
# ========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Tạo non-root user để chạy app an toàn
RUN adduser --disabled-password --home /app appuser
USER appuser

# Copy build output từ stage trước
COPY --from=build /app ./

EXPOSE 80
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
