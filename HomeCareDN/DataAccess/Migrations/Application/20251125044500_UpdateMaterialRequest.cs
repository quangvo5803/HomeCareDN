using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdateMaterialRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ConversationID",
                schema: "app",
                table: "MaterialRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistributorID",
                schema: "app",
                table: "Conversations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MaterialRequestID",
                schema: "app",
                table: "Conversations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_ConversationID",
                schema: "app",
                table: "MaterialRequests",
                column: "ConversationID",
                unique: true,
                filter: "[ConversationID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_Conversations_ConversationID",
                schema: "app",
                table: "MaterialRequests",
                column: "ConversationID",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "ConversationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_Conversations_ConversationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_ConversationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "ConversationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "DistributorID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "MaterialRequestID",
                schema: "app",
                table: "Conversations");
        }
    }
}
