using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateReviewEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "ReviewID",
                schema: "app",
                table: "Images",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Review",
                schema: "app",
                columns: table => new
                {
                    ReviewID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<string>(type: "text", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: true),
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: true),
                    PartnerID = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", maxLength: 5, nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Review", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK_Review_MaterialRequests_MaterialRequestID",
                        column: x => x.MaterialRequestID,
                        principalSchema: "app",
                        principalTable: "MaterialRequests",
                        principalColumn: "MaterialRequestID");
                    table.ForeignKey(
                        name: "FK_Review_ServiceRequests_ServiceRequestID",
                        column: x => x.ServiceRequestID,
                        principalSchema: "app",
                        principalTable: "ServiceRequests",
                        principalColumn: "ServiceRequestID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Images_ReviewID",
                schema: "app",
                table: "Images",
                column: "ReviewID");

            migrationBuilder.CreateIndex(
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review",
                column: "MaterialRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Review_ServiceRequestID",
                schema: "app",
                table: "Review",
                column: "ServiceRequestID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Review_ReviewID",
                schema: "app",
                table: "Images",
                column: "ReviewID",
                principalSchema: "app",
                principalTable: "Review",
                principalColumn: "ReviewID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Review_ReviewID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropTable(
                name: "Review",
                schema: "app");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_Images_ReviewID",
                schema: "app",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "ReviewID",
                schema: "app",
                table: "Images");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID");
        }
    }
}
