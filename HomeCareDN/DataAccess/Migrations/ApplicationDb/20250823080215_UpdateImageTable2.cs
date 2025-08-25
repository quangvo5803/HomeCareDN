using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class UpdateImageTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Brands_BrandID",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_BrandID",
                table: "Images");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_BrandLogoID",
                table: "Brands",
                column: "BrandLogoID");

            migrationBuilder.AddForeignKey(
                name: "FK_Brands_Images_BrandLogoID",
                table: "Brands",
                column: "BrandLogoID",
                principalTable: "Images",
                principalColumn: "ImageID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Brands_Images_BrandLogoID",
                table: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_Brands_BrandLogoID",
                table: "Brands");

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
    }
}
