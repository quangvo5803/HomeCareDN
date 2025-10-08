using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class RenamePartnerTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Partners_PartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropTable(
                name: "Partners",
                schema: "app");

            migrationBuilder.DropIndex(
                name: "IX_Images_PartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.AddColumn<Guid>(
                name: "PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PartnerRequests",
                schema: "app",
                columns: table => new
                {
                    PartnerID = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    PartnerType = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApprovedUserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AccountUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerRequests", x => x.PartnerID);
                    table.ForeignKey(
                        name: "FK_PartnerRequests_ApplicationUser_AccountUserId",
                        column: x => x.AccountUserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Images_PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerRequestPartnerID");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerRequests_AccountUserId",
                schema: "app",
                table: "PartnerRequests",
                column: "AccountUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerRequestPartnerID",
                principalSchema: "app",
                principalTable: "PartnerRequests",
                principalColumn: "PartnerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestPartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropTable(
                name: "PartnerRequests",
                schema: "app");

            migrationBuilder.DropIndex(
                name: "IX_Images_PartnerRequestPartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "PartnerRequestPartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.CreateTable(
                name: "Partners",
                schema: "app",
                columns: table => new
                {
                    PartnerID = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountUserId = table.Column<string>(type: "text", nullable: true),
                    ApprovedUserId = table.Column<string>(type: "text", nullable: true),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    PartnerType = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.PartnerID);
                    table.ForeignKey(
                        name: "FK_Partners_ApplicationUser_AccountUserId",
                        column: x => x.AccountUserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Images_PartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerID");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_AccountUserId",
                schema: "app",
                table: "Partners",
                column: "AccountUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Partners_PartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerID",
                principalSchema: "app",
                principalTable: "Partners",
                principalColumn: "PartnerID");
        }
    }
}
