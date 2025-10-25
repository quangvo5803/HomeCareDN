using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRequestStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpen",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "IsOpen",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "app",
                table: "ServiceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "app",
                table: "MaterialRequests",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "app",
                table: "MaterialRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorA~",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequestItems_MaterialID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequestItems_MaterialRequestID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplications_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications",
                column: "MaterialRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_DistributorApplications_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications",
                column: "MaterialRequestID",
                principalSchema: "app",
                principalTable: "MaterialRequests",
                principalColumn: "MaterialRequestID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequestItems_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialRequestID",
                principalSchema: "app",
                principalTable: "MaterialRequests",
                principalColumn: "MaterialRequestID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequestItems_Materials_MaterialID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialID",
                principalSchema: "app",
                principalTable: "Materials",
                principalColumn: "MaterialID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributo~",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DistributorApplications_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequestItems_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "MaterialRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequestItems_Materials_MaterialID",
                schema: "app",
                table: "MaterialRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributo~",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorA~",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequestItems_MaterialID",
                schema: "app",
                table: "MaterialRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequestItems_MaterialRequestID",
                schema: "app",
                table: "MaterialRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_DistributorApplications_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                schema: "app",
                table: "ServiceRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "app",
                table: "MaterialRequests",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                schema: "app",
                table: "MaterialRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
