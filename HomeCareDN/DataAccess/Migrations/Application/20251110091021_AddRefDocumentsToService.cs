using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class AddRefDocumentsToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ServiceID",
                schema: "app",
                table: "Documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ServiceID",
                schema: "app",
                table: "Documents",
                column: "ServiceID");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Services_ServiceID",
                schema: "app",
                table: "Documents",
                column: "ServiceID",
                principalSchema: "app",
                principalTable: "Services",
                principalColumn: "ServiceID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Services_ServiceID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ServiceID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ServiceID",
                schema: "app",
                table: "Documents");
        }
    }
}
