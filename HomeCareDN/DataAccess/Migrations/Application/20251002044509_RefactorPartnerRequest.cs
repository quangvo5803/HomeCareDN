using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class RefactorPartnerRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestPartnerID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_PartnerRequests_ApplicationUser_AccountUserId",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropTable(
                name: "Address",
                schema: "app");

            migrationBuilder.DropTable(
                name: "RefreshToken",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ApplicationUser",
                schema: "app");

            migrationBuilder.DropIndex(
                name: "IX_PartnerRequests_AccountUserId",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropColumn(
                name: "AccountUserId",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropColumn(
                name: "ApprovedUserId",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.DropColumn(
                name: "FullName",
                schema: "app",
                table: "PartnerRequests");

            migrationBuilder.RenameColumn(
                name: "PartnerType",
                schema: "app",
                table: "PartnerRequests",
                newName: "PartnerRequestType");

            migrationBuilder.RenameColumn(
                name: "PartnerID",
                schema: "app",
                table: "PartnerRequests",
                newName: "PartnerRequestID");

            migrationBuilder.RenameColumn(
                name: "PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                newName: "PartnerRequestID");

            migrationBuilder.RenameIndex(
                name: "IX_Images_PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                newName: "IX_Images_PartnerRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestID",
                schema: "app",
                table: "Images",
                column: "PartnerRequestID",
                principalSchema: "app",
                principalTable: "PartnerRequests",
                principalColumn: "PartnerRequestID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestID",
                schema: "app",
                table: "Images");

            migrationBuilder.RenameColumn(
                name: "PartnerRequestType",
                schema: "app",
                table: "PartnerRequests",
                newName: "PartnerType");

            migrationBuilder.RenameColumn(
                name: "PartnerRequestID",
                schema: "app",
                table: "PartnerRequests",
                newName: "PartnerID");

            migrationBuilder.RenameColumn(
                name: "PartnerRequestID",
                schema: "app",
                table: "Images",
                newName: "PartnerRequestPartnerID");

            migrationBuilder.RenameIndex(
                name: "IX_Images_PartnerRequestID",
                schema: "app",
                table: "Images",
                newName: "IX_Images_PartnerRequestPartnerID");

            migrationBuilder.AddColumn<string>(
                name: "AccountUserId",
                schema: "app",
                table: "PartnerRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedUserId",
                schema: "app",
                table: "PartnerRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                schema: "app",
                table: "PartnerRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ApplicationUser",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    CurrentOTP = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Gender = table.Column<int>(type: "integer", nullable: true),
                    LastOTPSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "text", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "text", nullable: true),
                    OTPExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUser", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Address",
                schema: "app",
                columns: table => new
                {
                    AddressID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Detail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.AddressID);
                    table.ForeignKey(
                        name: "FK_Address_ApplicationUser_UserId",
                        column: x => x.UserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshToken_ApplicationUser_UserId",
                        column: x => x.UserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PartnerRequests_AccountUserId",
                schema: "app",
                table: "PartnerRequests",
                column: "AccountUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Address_UserId",
                schema: "app",
                table: "Address",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                schema: "app",
                table: "RefreshToken",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_PartnerRequests_PartnerRequestPartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerRequestPartnerID",
                principalSchema: "app",
                principalTable: "PartnerRequests",
                principalColumn: "PartnerID");

            migrationBuilder.AddForeignKey(
                name: "FK_PartnerRequests_ApplicationUser_AccountUserId",
                schema: "app",
                table: "PartnerRequests",
                column: "AccountUserId",
                principalSchema: "app",
                principalTable: "ApplicationUser",
                principalColumn: "Id");
        }
    }
}
