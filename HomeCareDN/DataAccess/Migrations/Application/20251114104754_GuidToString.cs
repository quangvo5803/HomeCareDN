using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class GuidToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_ApplicationUser_UserId",
                schema: "app",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "UserID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "app",
                table: "Conversations",
                newName: "UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Conversations_UserId",
                schema: "app",
                table: "Conversations",
                newName: "IX_Conversations_UserID");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerID",
                schema: "app",
                table: "Conversations",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContractorID",
                schema: "app",
                table: "Conversations",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AdminID",
                schema: "app",
                table: "Conversations",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SenderID",
                schema: "app",
                table: "ChatMessages",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReceiverID",
                schema: "app",
                table: "ChatMessages",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_ApplicationUser_UserID",
                schema: "app",
                table: "Conversations",
                column: "UserID",
                principalSchema: "app",
                principalTable: "ApplicationUser",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_ApplicationUser_UserID",
                schema: "app",
                table: "Conversations");

            migrationBuilder.RenameColumn(
                name: "UserID",
                schema: "app",
                table: "Conversations",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Conversations_UserID",
                schema: "app",
                table: "Conversations",
                newName: "IX_Conversations_UserId");

            migrationBuilder.AlterColumn<Guid>(
                name: "CustomerID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ContractorID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AdminID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserID",
                schema: "app",
                table: "Conversations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "SenderID",
                schema: "app",
                table: "ChatMessages",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ReceiverID",
                schema: "app",
                table: "ChatMessages",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_ApplicationUser_UserId",
                schema: "app",
                table: "Conversations",
                column: "UserId",
                principalSchema: "app",
                principalTable: "ApplicationUser",
                principalColumn: "Id");
        }
    }
}
