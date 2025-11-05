using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class Add_Ref_Conversation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Conversations_ConversationID",
                schema: "app",
                table: "ServiceRequests",
                column: "ConversationID",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "ConversationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Conversations_ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ConversationID",
                schema: "app",
                table: "ServiceRequests");
        }
    }
}
