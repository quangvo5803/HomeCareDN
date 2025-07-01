# ------------ Stage 1: Build ------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set working directory inside container
WORKDIR /src

# Copy the solution and all project files (explicitly)
COPY *.sln .
COPY HomeCareDNAPI/*.csproj ./HomeCareDNAPI/
COPY BusinessLogic/*.csproj ./BusinessLogic/
COPY DataAccess/*.csproj ./DataAccess/
COPY Utility/*.csproj ./Utility/

# Copy the rest of the codebase
COPY . .

# Restore dependencies
RUN dotnet restore HomeCareDN.sln

# Publish the API project
RUN dotnet publish HomeCareDNAPI/HomeCareDNAPI.csproj -c Release -o /app --no-restore


# ------------ Stage 2: Runtime ------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app .

EXPOSE 80

ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
