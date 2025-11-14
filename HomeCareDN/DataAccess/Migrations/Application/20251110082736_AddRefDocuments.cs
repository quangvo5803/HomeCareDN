using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class AddRefDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PartnerRequestID",
                schema: "app",
                table: "Documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents",
                column: "ContractorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PartnerRequestID",
                schema: "app",
                table: "Documents",
                column: "PartnerRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Documents",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_PartnerRequests_PartnerRequestID",
                schema: "app",
                table: "Documents",
                column: "PartnerRequestID",
                principalSchema: "app",
                principalTable: "PartnerRequests",
                principalColumn: "PartnerRequestID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_PartnerRequests_PartnerRequestID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_PartnerRequestID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "PartnerRequestID",
                schema: "app",
                table: "Documents");
        }
    }
}
