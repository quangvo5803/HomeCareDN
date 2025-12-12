using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class AddSearchHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "searchHistories",
                schema: "app",
                columns: table => new
                {
                    SearchHistoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SearchTerm = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SearchDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_searchHistories", x => x.SearchHistoryID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "searchHistories",
                schema: "app");
        }
    }
}
