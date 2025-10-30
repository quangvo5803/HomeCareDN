using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class Add_Ref_Document : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents",
                column: "ContractorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ServiceRequestID",
                schema: "app",
                table: "Documents",
                column: "ServiceRequestID");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Documents",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "Documents",
                column: "ServiceRequestID",
                principalSchema: "app",
                principalTable: "ServiceRequests",
                principalColumn: "ServiceRequestID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ServiceRequestID",
                schema: "app",
                table: "Documents");
        }
    }
}
