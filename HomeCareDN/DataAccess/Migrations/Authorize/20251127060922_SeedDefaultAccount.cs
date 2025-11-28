using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DataAccess.Migrations.Authorize
{
    /// <inheritdoc />
    public partial class SeedDefaultAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "auth",
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "AverageRating", "ConcurrencyStamp", "CurrentOTP", "Email", "EmailConfirmed", "FullName", "Gender", "LastOTPSentAt", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "OTPExpiresAt", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "ProjectCount", "RatingCount", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[,]
                {
                    { "4e4386ec-e25d-464b-b2a3-ee57ecff614b", 0, 0.0, "5155088c-e771-4e48-8839-9b4bde56e041", null, "homecaredndistributor@gmail.com", true, "Distributor", null, null, false, null, "HOMECAREDNDISTRIBUTOR@GMAIL.COM", "HOMECAREDNDISTRIBUTOR@GMAIL.COM", null, "AQAAAAIAAYagAAAAEKg9WTuw72i6n/4AVl3xuhfY1pvl0BhDOdoYY1VHwQZbkgpd3y+4NXLaeGbeaEEoxQ==", null, false, 0, 0, "21a30e86-9725-48f9-960d-d08cd5071bef", false, "homecaredndistributor@gmail.com" },
                    { "9570d410-e3ea-46e0-aac1-bb17dff7457f", 0, 0.0, "47e299a4-1a69-4222-827d-6464cdfe431b", null, "homecaredn43@gmail.com", true, "Admin", null, null, false, null, "HOMECAREDN43@GMAIL.COM", "HOMECAREDN43@GMAIL.COM", null, "AQAAAAIAAYagAAAAEEHIVyRrM9T7MgQzaauFVnxO1UyTB2KnT/w1WlA8SSiHqssYtZMAeE3i4y6vlQ87NQ==", null, false, 0, 0, "f7ba3742-65a3-45be-b1d6-44d1b5b7f76f", false, "homecaredn43@gmail.com" },
                    { "cba463ec-27a1-4882-8515-afd8109ae7fa", 0, 0.0, "5fee51d6-7b36-48e9-b8ef-650c214151f4", null, "homecaredncontractor@gmail.com", true, "Contractor", null, null, false, null, "HOMECAREDNCONTRACTOR@GMAIL.COM", "HOMECAREDNCONTRACTOR@GMAIL.COM", null, "AQAAAAIAAYagAAAAEAyrK2r8/L8TCdYGw/TutzQNiNUW6NrK4nNpwbsQ/8QAF4o77zXs4FCPvSyLnjUeIg==", null, false, 0, 0, "fbdc4468-e443-49c2-8d8c-114e5dedb4fb", false, "homecaredncontractor@gmail.com" }
                });

            migrationBuilder.InsertData(
                schema: "auth",
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { "d1aa179c-780e-4938-a169-1d18e87f4b2d", "4e4386ec-e25d-464b-b2a3-ee57ecff614b" },
                    { "b8d2f939-6450-41c6-b5f2-d9bc0f1c9f94", "9570d410-e3ea-46e0-aac1-bb17dff7457f" },
                    { "b0e6799f-ea1b-4df1-a0c0-0dc77c4f54cc", "cba463ec-27a1-4882-8515-afd8109ae7fa" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "d1aa179c-780e-4938-a169-1d18e87f4b2d", "4e4386ec-e25d-464b-b2a3-ee57ecff614b" });

            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "b8d2f939-6450-41c6-b5f2-d9bc0f1c9f94", "9570d410-e3ea-46e0-aac1-bb17dff7457f" });

            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "b0e6799f-ea1b-4df1-a0c0-0dc77c4f54cc", "cba463ec-27a1-4882-8515-afd8109ae7fa" });

            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "4e4386ec-e25d-464b-b2a3-ee57ecff614b");

            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "9570d410-e3ea-46e0-aac1-bb17dff7457f");

            migrationBuilder.DeleteData(
                schema: "auth",
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "cba463ec-27a1-4882-8515-afd8109ae7fa");
        }
    }
}
