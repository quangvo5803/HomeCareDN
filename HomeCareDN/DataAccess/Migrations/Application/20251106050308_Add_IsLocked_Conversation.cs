using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class Add_IsLocked_Conversation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Conversations_ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "ContractorApplicationID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                schema: "app",
                table: "Conversations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ContractorApplicationID",
                schema: "app",
                table: "Conversations",
                column: "ContractorApplicationID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations",
                column: "ServiceRequestID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Conversations",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ContractorApplicationID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ContractorApplicationID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                schema: "app",
                table: "Conversations");

            migrationBuilder.AddColumn<Guid>(
                name: "ConversationID",
                schema: "app",
                table: "ServiceRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_ConversationID",
                schema: "app",
                table: "ServiceRequests",
                column: "ConversationID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations",
                column: "ServiceRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Conversations_ConversationID",
                schema: "app",
                table: "ServiceRequests",
                column: "ConversationID",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "ConversationID");
        }
    }
}
