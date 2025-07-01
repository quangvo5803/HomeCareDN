# ------------ STEP 1: BUILD ------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and all projects
COPY ../HomeCareDN.sln ./
COPY ../BusinessLogic/*.csproj ./BusinessLogic/
COPY ../DataAccess/*.csproj ./DataAccess/
COPY ../Utility/*.csproj ./Utility/
COPY ./*.csproj ./

# Restore
RUN dotnet restore ./HomeCareDNAPI.csproj

# Copy all source code
COPY .. ./

# Publish to output folder
RUN dotnet publish ./HomeCareDNAPI.csproj -c Release -o /app/publish

# ------------ STEP 2: RUNTIME ------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish ./
EXPOSE 80
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
