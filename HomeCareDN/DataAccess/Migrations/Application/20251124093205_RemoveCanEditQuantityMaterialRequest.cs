using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class RemoveCanEditQuantityMaterialRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanEditQuantity",
                schema: "app",
                table: "MaterialRequests");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanEditQuantity",
                schema: "app",
                table: "MaterialRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
