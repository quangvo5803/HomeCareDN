# STEP 1: BUILD
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and all csproj files (từ thư mục cha)
COPY ../HomeCareDN.sln ./
COPY ../BusinessLogic/*.csproj ./BusinessLogic/
COPY ../DataAccess/*.csproj ./DataAccess/
COPY ../Utility/*.csproj ./Utility/
COPY *.csproj ./

# Restore dependencies
RUN dotnet restore ./HomeCareDNAPI.csproj

# Copy toàn bộ source code
COPY ../ ./

# Publish
RUN dotnet publish ./HomeCareDNAPI.csproj -c Release -o /app/publish

# STEP 2: RUNTIME
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish ./
EXPOSE 80
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
