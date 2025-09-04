using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class UpdateImageTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Brands_Images_LogoImageImageID",
                table: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_Brands_LogoImageImageID",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "BrandLogo",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "LogoImageImageID",
                table: "Brands");

            migrationBuilder.AddColumn<Guid>(
                name: "BrandID",
                table: "Images",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BrandLogoID",
                table: "Brands",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Images_BrandID",
                table: "Images",
                column: "BrandID",
                unique: true,
                filter: "[BrandID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Brands_BrandID",
                table: "Images",
                column: "BrandID",
                principalTable: "Brands",
                principalColumn: "BrandID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Brands_BrandID",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_BrandID",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "BrandID",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "BrandLogoID",
                table: "Brands");

            migrationBuilder.AddColumn<string>(
                name: "BrandLogo",
                table: "Brands",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "LogoImageImageID",
                table: "Brands",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_LogoImageImageID",
                table: "Brands",
                column: "LogoImageImageID");

            migrationBuilder.AddForeignKey(
                name: "FK_Brands_Images_LogoImageImageID",
                table: "Brands",
                column: "LogoImageImageID",
                principalTable: "Images",
                principalColumn: "ImageID");
        }
    }
}
