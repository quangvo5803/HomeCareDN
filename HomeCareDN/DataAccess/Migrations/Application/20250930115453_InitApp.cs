using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class InitApp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "app");

            migrationBuilder.CreateTable(
                name: "ApplicationUser",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Gender = table.Column<int>(type: "integer", nullable: true),
                    CurrentOTP = table.Column<string>(type: "text", nullable: true),
                    OTPExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastOTPSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "text", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUser", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContactSupports",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    IsProcessed = table.Column<bool>(type: "boolean", nullable: false),
                    ReplyContent = table.Column<string>(type: "text", nullable: true),
                    ReplyBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSupports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                schema: "app",
                columns: table => new
                {
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<string>(type: "text", nullable: false),
                    ContractorId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.ConversationId);
                });

            migrationBuilder.CreateTable(
                name: "ServiceRequests",
                schema: "app",
                columns: table => new
                {
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<string>(type: "text", nullable: false),
                    AddressId = table.Column<string>(type: "text", nullable: false),
                    ServiceType = table.Column<string>(type: "text", nullable: false),
                    PackageOption = table.Column<string>(type: "text", nullable: false),
                    BuildingType = table.Column<string>(type: "text", nullable: false),
                    MainStructureType = table.Column<string>(type: "text", nullable: false),
                    DesignStyle = table.Column<string>(type: "text", nullable: true),
                    Width = table.Column<double>(type: "double precision", nullable: false),
                    Length = table.Column<double>(type: "double precision", nullable: false),
                    Floors = table.Column<int>(type: "integer", nullable: false),
                    EstimatePrice = table.Column<double>(type: "double precision", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsOpen = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => x.ServiceRequestID);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                schema: "app",
                columns: table => new
                {
                    ServiceID = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NameEN = table.Column<string>(type: "text", nullable: true),
                    ServiceType = table.Column<string>(type: "text", nullable: false),
                    PackageOption = table.Column<string>(type: "text", nullable: true),
                    BuildingType = table.Column<string>(type: "text", nullable: false),
                    MainStructureType = table.Column<int>(type: "integer", nullable: true),
                    DesignStyle = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DescriptionEN = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceID);
                });

            migrationBuilder.CreateTable(
                name: "Address",
                schema: "app",
                columns: table => new
                {
                    AddressID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Detail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.AddressID);
                    table.ForeignKey(
                        name: "FK_Address_ApplicationUser_UserId",
                        column: x => x.UserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Partners",
                schema: "app",
                columns: table => new
                {
                    PartnerID = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    PartnerType = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApprovedUserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AccountUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.PartnerID);
                    table.ForeignKey(
                        name: "FK_Partners_ApplicationUser_AccountUserId",
                        column: x => x.AccountUserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshToken_ApplicationUser_UserId",
                        column: x => x.UserId,
                        principalSchema: "app",
                        principalTable: "ApplicationUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                schema: "app",
                columns: table => new
                {
                    ChatMessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<string>(type: "text", nullable: false),
                    ReceiverId = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.ChatMessageId);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalSchema: "app",
                        principalTable: "Conversations",
                        principalColumn: "ConversationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractorApplications",
                schema: "app",
                columns: table => new
                {
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EstimatePrice = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractorApplications", x => x.ContractorApplicationID);
                    table.ForeignKey(
                        name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                        column: x => x.ServiceRequestID,
                        principalSchema: "app",
                        principalTable: "ServiceRequests",
                        principalColumn: "ServiceRequestID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Brands",
                schema: "app",
                columns: table => new
                {
                    BrandID = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandName = table.Column<string>(type: "text", nullable: false),
                    BrandDescription = table.Column<string>(type: "text", nullable: true),
                    BrandLogoID = table.Column<Guid>(type: "uuid", nullable: true),
                    BrandNameEN = table.Column<string>(type: "text", nullable: true),
                    BrandDescriptionEN = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.BrandID);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "app",
                columns: table => new
                {
                    CategoryID = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CategoryNameEN = table.Column<string>(type: "text", nullable: true),
                    CategoryLogoID = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Materials",
                schema: "app",
                columns: table => new
                {
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    NameEN = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    BrandID = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryID = table.Column<Guid>(type: "uuid", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: true),
                    UnitEN = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DescriptionEN = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Materials", x => x.MaterialID);
                    table.ForeignKey(
                        name: "FK_Materials_Brands_BrandID",
                        column: x => x.BrandID,
                        principalSchema: "app",
                        principalTable: "Brands",
                        principalColumn: "BrandID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Materials_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalSchema: "app",
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Images",
                schema: "app",
                columns: table => new
                {
                    ImageID = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceID = table.Column<Guid>(type: "uuid", nullable: true),
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: true),
                    BrandID = table.Column<Guid>(type: "uuid", nullable: true),
                    CategoryID = table.Column<Guid>(type: "uuid", nullable: true),
                    PartnerID = table.Column<Guid>(type: "uuid", nullable: true),
                    PublicId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.ImageID);
                    table.ForeignKey(
                        name: "FK_Images_ContractorApplications_ContractorApplicationID",
                        column: x => x.ContractorApplicationID,
                        principalSchema: "app",
                        principalTable: "ContractorApplications",
                        principalColumn: "ContractorApplicationID");
                    table.ForeignKey(
                        name: "FK_Images_Materials_MaterialID",
                        column: x => x.MaterialID,
                        principalSchema: "app",
                        principalTable: "Materials",
                        principalColumn: "MaterialID");
                    table.ForeignKey(
                        name: "FK_Images_Partners_PartnerID",
                        column: x => x.PartnerID,
                        principalSchema: "app",
                        principalTable: "Partners",
                        principalColumn: "PartnerID");
                    table.ForeignKey(
                        name: "FK_Images_ServiceRequests_ServiceRequestID",
                        column: x => x.ServiceRequestID,
                        principalSchema: "app",
                        principalTable: "ServiceRequests",
                        principalColumn: "ServiceRequestID");
                    table.ForeignKey(
                        name: "FK_Images_Services_ServiceID",
                        column: x => x.ServiceID,
                        principalSchema: "app",
                        principalTable: "Services",
                        principalColumn: "ServiceID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Address_UserId",
                schema: "app",
                table: "Address",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_BrandLogoID",
                schema: "app",
                table: "Brands",
                column: "BrandLogoID");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_CategoryLogoID",
                schema: "app",
                table: "Categories",
                column: "CategoryLogoID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId",
                schema: "app",
                table: "ChatMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractorApplications_ServiceRequestID",
                schema: "app",
                table: "ContractorApplications",
                column: "ServiceRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ContractorApplicationID",
                schema: "app",
                table: "Images",
                column: "ContractorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_Images_MaterialID",
                schema: "app",
                table: "Images",
                column: "MaterialID");

            migrationBuilder.CreateIndex(
                name: "IX_Images_PartnerID",
                schema: "app",
                table: "Images",
                column: "PartnerID");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ServiceID",
                schema: "app",
                table: "Images",
                column: "ServiceID");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ServiceRequestID",
                schema: "app",
                table: "Images",
                column: "ServiceRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_BrandID",
                schema: "app",
                table: "Materials",
                column: "BrandID");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_CategoryID",
                schema: "app",
                table: "Materials",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_AccountUserId",
                schema: "app",
                table: "Partners",
                column: "AccountUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                schema: "app",
                table: "RefreshToken",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Brands_Images_BrandLogoID",
                schema: "app",
                table: "Brands",
                column: "BrandLogoID",
                principalSchema: "app",
                principalTable: "Images",
                principalColumn: "ImageID");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                schema: "app",
                table: "Categories",
                column: "CategoryLogoID",
                principalSchema: "app",
                principalTable: "Images",
                principalColumn: "ImageID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Partners_ApplicationUser_AccountUserId",
                schema: "app",
                table: "Partners");

            migrationBuilder.DropForeignKey(
                name: "FK_Brands_Images_BrandLogoID",
                schema: "app",
                table: "Brands");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                schema: "app",
                table: "Categories");

            migrationBuilder.DropTable(
                name: "Address",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ChatMessages",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ContactSupports",
                schema: "app");

            migrationBuilder.DropTable(
                name: "RefreshToken",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Conversations",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ApplicationUser",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Images",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ContractorApplications",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Materials",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Partners",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Services",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ServiceRequests",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Brands",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "app");
        }
    }
}
