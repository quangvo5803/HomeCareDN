using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class UpdatePayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceRequestID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MaterialRequestID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "DistributorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationID",
                unique: true,
                filter: "[SelectedDistributorApplicationID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_DistributorApplications_DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "DistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_DistributorApplications_DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

            migrationBuilder.DropColumn(
                name: "DistributorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "MaterialRequestID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceRequestID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
