using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class RemoveIsNotified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsNotified",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "IsNotified",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.AddColumn<int>(
                name: "PendingCount",
                schema: "app",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PendingCount",
                schema: "app",
                table: "Notifications");

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                schema: "app",
                table: "ServiceRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                schema: "app",
                table: "MaterialRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
