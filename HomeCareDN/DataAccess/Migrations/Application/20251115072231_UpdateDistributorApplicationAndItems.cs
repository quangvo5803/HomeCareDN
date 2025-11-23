using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateDistributorApplicationAndItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueCommisionTime",
                schema: "app",
                table: "DistributorApplications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplicationItems_MaterialID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "MaterialID");

            migrationBuilder.AddForeignKey(
                name: "FK_DistributorApplicationItems_Materials_MaterialID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "MaterialID",
                principalSchema: "app",
                principalTable: "Materials",
                principalColumn: "MaterialID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DistributorApplicationItems_Materials_MaterialID",
                schema: "app",
                table: "DistributorApplicationItems");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_DistributorApplicationItems_MaterialID",
                schema: "app",
                table: "DistributorApplicationItems");

            migrationBuilder.DropColumn(
                name: "DueCommisionTime",
                schema: "app",
                table: "DistributorApplications");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID");
        }
    }
}
