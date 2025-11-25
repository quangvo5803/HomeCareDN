using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateNotify : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.AddColumn<string>(
                name: "DataValue",
                schema: "app",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationID",
                unique: true,
                filter: "[SelectedDistributorApplicationID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "DataValue",
                schema: "app",
                table: "Notifications");

            migrationBuilder.AddColumn<Guid>(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");
        }
    }
}
