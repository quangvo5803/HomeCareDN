using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class AddSignatureToPartnerRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsContractSigned",
                schema: "app",
                table: "PartnerRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SignatureUrl",
                schema: "app",
                table: "PartnerRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignedAt",
                schema: "app",
                table: "PartnerRequests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsContractSigned",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropColumn(
                name: "SignatureUrl",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropColumn(
                name: "SignedAt",
                schema: "app",
                table: "PartnerRequests");
        }
    }
}
