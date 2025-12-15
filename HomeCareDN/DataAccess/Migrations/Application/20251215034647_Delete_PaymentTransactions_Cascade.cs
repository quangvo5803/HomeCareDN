using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class Delete_PaymentTransactions_Cascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "ContractorApplicationID",
                principalSchema: "app",
                principalTable: "ContractorApplications",
                principalColumn: "ContractorApplicationID");
        }
    }
}
