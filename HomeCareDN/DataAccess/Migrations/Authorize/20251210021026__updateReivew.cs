using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Authorize
{
    /// <inheritdoc />
    public partial class _updateReivew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LargeScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MediumScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReputationPoints",
                schema: "auth",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SmallScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "4e4386ec-e25d-464b-b2a3-ee57ecff614b",
                columns: new[] { "ConcurrencyStamp", "LargeScaleProjectCount", "MediumScaleProjectCount", "PasswordHash", "ReputationPoints", "SecurityStamp", "SmallScaleProjectCount" },
                values: new object[] { "f606df6a-4657-4cb0-97e1-0259727cba8d", 0, 0, "AQAAAAIAAYagAAAAED+Ef6n6RND0b8AxqP1F61MG75W7WVOrjwQtZ1GA/5M+6H0KI/ehiI8KMSQ+eRo29g==", 0, "8330bfa6-29db-4e7a-ae8c-028beba4536d", 0 });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "9570d410-e3ea-46e0-aac1-bb17dff7457f",
                columns: new[] { "ConcurrencyStamp", "LargeScaleProjectCount", "MediumScaleProjectCount", "PasswordHash", "ReputationPoints", "SecurityStamp", "SmallScaleProjectCount" },
                values: new object[] { "a86ac35d-a053-47a5-b02c-2df7eef12480", 0, 0, "AQAAAAIAAYagAAAAEOAvcu5y5oEP/3/tiWWFJDPD0TnrbFV4oSnJ4JziXw6/Y2Fw3i8HIZJ0Uutv3aHQdA==", 0, "7a23463d-8964-452e-b0ad-3f0ab5f47d24", 0 });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "cba463ec-27a1-4882-8515-afd8109ae7fa",
                columns: new[] { "ConcurrencyStamp", "LargeScaleProjectCount", "MediumScaleProjectCount", "PasswordHash", "ReputationPoints", "SecurityStamp", "SmallScaleProjectCount" },
                values: new object[] { "a999632f-17ef-4b45-9b57-3b892d4c5478", 0, 0, "AQAAAAIAAYagAAAAEK5rVxuAkI/1GxQ4g17P3dymmHjcV2kXnboTAi8ZIIzk73Kk7/2o0P4wRjV79EUFdA==", 0, "efd6512c-5d9c-40af-ba80-66a1596ec6b6", 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LargeScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MediumScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ReputationPoints",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SmallScaleProjectCount",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "4e4386ec-e25d-464b-b2a3-ee57ecff614b",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5155088c-e771-4e48-8839-9b4bde56e041", "AQAAAAIAAYagAAAAEKg9WTuw72i6n/4AVl3xuhfY1pvl0BhDOdoYY1VHwQZbkgpd3y+4NXLaeGbeaEEoxQ==", "21a30e86-9725-48f9-960d-d08cd5071bef" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "9570d410-e3ea-46e0-aac1-bb17dff7457f",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "47e299a4-1a69-4222-827d-6464cdfe431b", "AQAAAAIAAYagAAAAEEHIVyRrM9T7MgQzaauFVnxO1UyTB2KnT/w1WlA8SSiHqssYtZMAeE3i4y6vlQ87NQ==", "f7ba3742-65a3-45be-b1d6-44d1b5b7f76f" });

            migrationBuilder.UpdateData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "cba463ec-27a1-4882-8515-afd8109ae7fa",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5fee51d6-7b36-48e9-b8ef-650c214151f4", "AQAAAAIAAYagAAAAEAyrK2r8/L8TCdYGw/TutzQNiNUW6NrK4nNpwbsQ/8QAF4o77zXs4FCPvSyLnjUeIg==", "fbdc4468-e443-49c2-8d8c-114e5dedb4fb" });
        }
    }
}
