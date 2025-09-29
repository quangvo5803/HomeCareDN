using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class UpdateServiceRequestTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSubmited",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<string>(
                name: "AddressID",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressID",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<bool>(
                name: "IsSubmited",
                table: "ServiceRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
