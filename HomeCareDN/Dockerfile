# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.sln ./
COPY HomeCareDNAPI/*.csproj ./HomeCareDNAPI/
COPY BusinessLogic/*.csproj ./BusinessLogic/
COPY DataAccess/*.csproj ./DataAccess/
COPY Utility/*.csproj ./Utility/

COPY . .

RUN dotnet restore HomeCareDN.sln
RUN dotnet publish HomeCareDNAPI/HomeCareDNAPI.csproj -c Release -o /app --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 80
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
