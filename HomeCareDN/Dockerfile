# ------------------------
# Stage 1: Build
# ------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set working directory inside container
WORKDIR /src

# Copy the entire source code
COPY . .

# Restore dependencies
RUN dotnet restore HomeCareDN.sln

# Publish the API project
RUN dotnet publish HomeCareDNAPI/HomeCareDNAPI.csproj -c Release -o /app --no-restore

# ------------------------
# Stage 2: Runtime
# ------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app .

# Expose the port your API runs on (optional)
EXPOSE 80

# Start the API
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
