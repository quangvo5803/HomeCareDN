using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class CreateMaterialRequetEntityAndRelatedEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DistributorApplicationItems",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationItemID = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: false),
                    Price = table.Column<double>(type: "double precision", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistributorApplicationItems", x => x.DistributorApplicationItemID);
                });

            migrationBuilder.CreateTable(
                name: "DistributorApplications",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributorID = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistributorApplications", x => x.DistributorApplicationID);
                });

            migrationBuilder.CreateTable(
                name: "MaterialRequestItems",
                schema: "app",
                columns: table => new
                {
                    MaterialRequestItemID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialRequestItems", x => x.MaterialRequestItemID);
                });

            migrationBuilder.CreateTable(
                name: "MaterialRequests",
                schema: "app",
                columns: table => new
                {
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedDistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsOpen = table.Column<bool>(type: "boolean", nullable: false),
                    CanEditQuantity = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialRequests", x => x.MaterialRequestID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DistributorApplicationItems",
                schema: "app");

            migrationBuilder.DropTable(
                name: "DistributorApplications",
                schema: "app");

            migrationBuilder.DropTable(
                name: "MaterialRequestItems",
                schema: "app");

            migrationBuilder.DropTable(
                name: "MaterialRequests",
                schema: "app");
        }
    }
}
