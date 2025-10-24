using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Add_Ref_Document_Partner : Migration
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
                name: "IX_Documents_PartnerRequestID",
                schema: "app",
                table: "Documents",
                column: "PartnerRequestID");

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
                name: "FK_Documents_PartnerRequests_PartnerRequestID",
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
