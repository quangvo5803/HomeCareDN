FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY HomeCareDN.sln ./
COPY BusinessLogic/*.csproj ./BusinessLogic/
COPY DataAccess/*.csproj ./DataAccess/
COPY Utility/*.csproj ./Utility/
COPY HomeCareDNAPI/*.csproj ./HomeCareDNAPI/

RUN dotnet restore

COPY . .

WORKDIR /src/HomeCareDNAPI
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "HomeCareDNAPI.dll"]
