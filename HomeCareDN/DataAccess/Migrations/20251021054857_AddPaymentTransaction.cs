using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                schema: "app",
                columns: table => new
                {
                    PaymentTransactionID = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ItemName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrderCode = table.Column<long>(type: "bigint", nullable: false),
                    CheckoutUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PaymentLinkID = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.PaymentTransactionID);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_ContractorApplications_ContractorApplic~",
                        column: x => x.ContractorApplicationID,
                        principalSchema: "app",
                        principalTable: "ContractorApplications",
                        principalColumn: "ContractorApplicationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "ContractorApplicationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentTransactions",
                schema: "app");
        }
    }
}
