using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AddCategoryCreateBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                table: "Categories");

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryLogoID",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserID",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                table: "Categories",
                column: "CategoryLogoID",
                principalTable: "Images",
                principalColumn: "ImageID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Categories");

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryLogoID",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                table: "Categories",
                column: "CategoryLogoID",
                principalTable: "Images",
                principalColumn: "ImageID");
        }
    }
}
