using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class AdminUnread : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests"
            );

            migrationBuilder.DropColumn(
                name: "AdminUnreadCount",
                schema: "app",
                table: "Conversations"
            );

            migrationBuilder.AddColumn<bool>(
                name: "IsAdminUnread",
                schema: "app",
                table: "Conversations",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<bool>(
                name: "IsAdminRead",
                schema: "app",
                table: "ChatMessages",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DistributorApplicationItems_DistributorApplications_Distrib~",
                schema: "app",
                table: "DistributorApplicationItems"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_PartnerRequests_PartnerRequestID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Services_ServiceID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Review_ReviewID",
                schema: "app",
                table: "Images"
            );

            migrationBuilder.DropTable(name: "Review", schema: "app");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests"
            );

            migrationBuilder.DropIndex(name: "IX_Images_ReviewID", schema: "app", table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropIndex(
                name: "IX_Documents_PartnerRequestID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropIndex(
                name: "IX_Documents_ServiceID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropIndex(
                name: "IX_DistributorApplicationItems_DistributorApplicationID",
                schema: "app",
                table: "DistributorApplicationItems"
            );

            migrationBuilder.DropColumn(
                name: "AddressId",
                schema: "app",
                table: "MaterialRequests"
            );

            migrationBuilder.DropColumn(name: "ReviewID", schema: "app", table: "Images");

            migrationBuilder.DropColumn(
                name: "PartnerRequestID",
                schema: "app",
                table: "Documents"
            );

            migrationBuilder.DropColumn(name: "ServiceID", schema: "app", table: "Documents");

            migrationBuilder.DropColumn(
                name: "IsAdminUnread",
                schema: "app",
                table: "Conversations"
            );

            migrationBuilder.DropColumn(name: "IsAdminRead", schema: "app", table: "ChatMessages");

            migrationBuilder.AddColumn<int>(
                name: "AdminUnreadCount",
                schema: "app",
                table: "Conversations",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID"
            );
        }
    }
}
