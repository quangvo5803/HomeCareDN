using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Authorize
{
    /// <inheritdoc />
    public partial class UpdatePartner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPartnerComfirm",
                schema: "auth",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "4e4386ec-e25d-464b-b2a3-ee57ecff614b",
                columns: new[] { "ConcurrencyStamp", "IsPartnerComfirm", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c2c111be-6ec4-4338-8526-934cb55347c7", null, "AQAAAAIAAYagAAAAECDN46KNkf+vnEcJOA1wY8O4iemLIrHL/xVROgFMT6d3MhsdtpDTvW1wK5GPHGKQrA==", "071e4937-65e5-4bec-aeae-f3014c671175" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "9570d410-e3ea-46e0-aac1-bb17dff7457f",
                columns: new[] { "ConcurrencyStamp", "IsPartnerComfirm", "PasswordHash", "SecurityStamp" },
                values: new object[] { "9b2687e8-2163-4506-b125-c93c3c711a1d", null, "AQAAAAIAAYagAAAAEM3ylXgLCp6lKUk7ltDMpcVW92RpvpPRV/RNparxAllNA5TrRcD2IGBBxomFRMRCaA==", "93a896c5-a844-4f7b-86ed-f09ce2ecad4f" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "cba463ec-27a1-4882-8515-afd8109ae7fa",
                columns: new[] { "ConcurrencyStamp", "IsPartnerComfirm", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b94ba347-3477-43d5-bc1e-fcf5b3adb03f", null, "AQAAAAIAAYagAAAAENE52jv3UYpHXhu4BN9/bjoIVV2QCwVAIM7fpkSIMHbww9LMZI1T/OoEZgOQpnlA9g==", "e80a63f1-bffa-4040-b8c8-f28144aabb54" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPartnerComfirm",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "4e4386ec-e25d-464b-b2a3-ee57ecff614b",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f606df6a-4657-4cb0-97e1-0259727cba8d", "AQAAAAIAAYagAAAAED+Ef6n6RND0b8AxqP1F61MG75W7WVOrjwQtZ1GA/5M+6H0KI/ehiI8KMSQ+eRo29g==", "8330bfa6-29db-4e7a-ae8c-028beba4536d" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "9570d410-e3ea-46e0-aac1-bb17dff7457f",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a86ac35d-a053-47a5-b02c-2df7eef12480", "AQAAAAIAAYagAAAAEOAvcu5y5oEP/3/tiWWFJDPD0TnrbFV4oSnJ4JziXw6/Y2Fw3i8HIZJ0Uutv3aHQdA==", "7a23463d-8964-452e-b0ad-3f0ab5f47d24" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "cba463ec-27a1-4882-8515-afd8109ae7fa",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a999632f-17ef-4b45-9b57-3b892d4c5478", "AQAAAAIAAYagAAAAEK5rVxuAkI/1GxQ4g17P3dymmHjcV2kXnboTAi8ZIIzk73Kk7/2o0P4wRjV79EUFdA==", "efd6512c-5d9c-40af-ba80-66a1596ec6b6" });
        }
    }
}
