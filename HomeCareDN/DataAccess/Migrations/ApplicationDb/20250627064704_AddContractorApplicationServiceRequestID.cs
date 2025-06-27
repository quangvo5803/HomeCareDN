using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AddContractorApplicationServiceRequestID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                table: "ContractorApplications");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceRequestID",
                table: "ContractorApplications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                table: "ContractorApplications",
                column: "ServiceRequestID",
                principalTable: "ServiceRequests",
                principalColumn: "ServiceRequestID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                table: "ContractorApplications");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceRequestID",
                table: "ContractorApplications",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                table: "ContractorApplications",
                column: "ServiceRequestID",
                principalTable: "ServiceRequests",
                principalColumn: "ServiceRequestID");
        }
    }
}
