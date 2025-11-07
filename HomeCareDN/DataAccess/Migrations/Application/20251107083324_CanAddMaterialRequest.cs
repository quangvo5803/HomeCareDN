using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class CanAddMaterialRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanAddMaterial",
                schema: "app",
                table: "MaterialRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanAddMaterial",
                schema: "app",
                table: "MaterialRequests");
        }
    }
}
