using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateMaterialRequest1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review");

            migrationBuilder.CreateIndex(
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review",
                column: "MaterialRequestID",
                unique: true,
                filter: "[MaterialRequestID] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review");

            migrationBuilder.CreateIndex(
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review",
                column: "MaterialRequestID");
        }
    }
}
