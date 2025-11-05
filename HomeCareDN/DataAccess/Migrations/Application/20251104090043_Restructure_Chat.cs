using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class Restructure_Chat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                schema: "app",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IsRead",
                schema: "app",
                table: "ChatMessages");

            migrationBuilder.RenameColumn(
                name: "CustomerId",
                schema: "app",
                table: "Conversations",
                newName: "CustomerID");

            migrationBuilder.RenameColumn(
                name: "ContractorId",
                schema: "app",
                table: "Conversations",
                newName: "ContractorID");

            migrationBuilder.RenameColumn(
                name: "ConversationId",
                schema: "app",
                table: "Conversations",
                newName: "ConversationID");

            migrationBuilder.RenameColumn(
                name: "SenderId",
                schema: "app",
                table: "ChatMessages",
                newName: "SenderID");

            migrationBuilder.RenameColumn(
                name: "ReceiverId",
                schema: "app",
                table: "ChatMessages",
                newName: "ReceiverID");

            migrationBuilder.RenameColumn(
                name: "ConversationId",
                schema: "app",
                table: "ChatMessages",
                newName: "ConversationID");

            migrationBuilder.RenameColumn(
                name: "ChatMessageId",
                schema: "app",
                table: "ChatMessages",
                newName: "ChatMessageID");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_ConversationId",
                schema: "app",
                table: "ChatMessages",
                newName: "IX_ChatMessages_ConversationID");

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceRequestID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations",
                column: "ServiceRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationID",
                schema: "app",
                table: "ChatMessages",
                column: "ConversationID",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "ConversationID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "Conversations",
                column: "ServiceRequestID",
                principalSchema: "app",
                principalTable: "ServiceRequests",
                principalColumn: "ServiceRequestID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationID",
                schema: "app",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "ServiceRequestID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.RenameColumn(
                name: "CustomerID",
                schema: "app",
                table: "Conversations",
                newName: "CustomerId");

            migrationBuilder.RenameColumn(
                name: "ContractorID",
                schema: "app",
                table: "Conversations",
                newName: "ContractorId");

            migrationBuilder.RenameColumn(
                name: "ConversationID",
                schema: "app",
                table: "Conversations",
                newName: "ConversationId");

            migrationBuilder.RenameColumn(
                name: "SenderID",
                schema: "app",
                table: "ChatMessages",
                newName: "SenderId");

            migrationBuilder.RenameColumn(
                name: "ReceiverID",
                schema: "app",
                table: "ChatMessages",
                newName: "ReceiverId");

            migrationBuilder.RenameColumn(
                name: "ConversationID",
                schema: "app",
                table: "ChatMessages",
                newName: "ConversationId");

            migrationBuilder.RenameColumn(
                name: "ChatMessageID",
                schema: "app",
                table: "ChatMessages",
                newName: "ChatMessageId");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_ConversationID",
                schema: "app",
                table: "ChatMessages",
                newName: "IX_ChatMessages_ConversationId");

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                schema: "app",
                table: "Conversations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                schema: "app",
                table: "ChatMessages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Conversations_ConversationId",
                schema: "app",
                table: "ChatMessages",
                column: "ConversationId",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "ConversationId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
