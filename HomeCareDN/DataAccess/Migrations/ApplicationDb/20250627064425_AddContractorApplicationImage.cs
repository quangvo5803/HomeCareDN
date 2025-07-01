using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AddContractorApplicationImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractorApplicationID",
                table: "Images",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Images_ContractorApplicationID",
                table: "Images",
                column: "ContractorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_ContractorApplications_ContractorApplicationID",
                table: "Images",
                column: "ContractorApplicationID",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_ContractorApplications_ContractorApplicationID",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_ContractorApplicationID",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "ContractorApplicationID",
                table: "Images");
        }
    }
}
