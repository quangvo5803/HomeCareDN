using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateDistributorApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplicationItems_DistributorApplicationID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "DistributorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_DistributorApplicationItems_DistributorApplications_Distrib~",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "DistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DistributorApplicationItems_DistributorApplications_Distrib~",
                schema: "app",
                table: "DistributorApplicationItems");

            migrationBuilder.DropIndex(
                name: "IX_DistributorApplicationItems_DistributorApplicationID",
                schema: "app",
                table: "DistributorApplicationItems");
        }
    }
}
