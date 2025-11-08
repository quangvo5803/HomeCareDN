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
                    ReplyBy = table.Column<string>(type: "text", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    ConversationID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractorID = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.ConversationID);
                });

            migrationBuilder.CreateTable(
                name: "DistributorApplicationItems",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationItemID = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: false),
                    Price = table.Column<double>(type: "double precision", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistributorApplicationItems", x => x.DistributorApplicationItemID);
                });

            migrationBuilder.CreateTable(
                name: "PartnerRequests",
                schema: "app",
                columns: table => new
                {
                    PartnerRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    PartnerRequestType = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerRequests", x => x.PartnerRequestID);
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
                    DescriptionEN = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceID);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                schema: "app",
                columns: table => new
                {
                    ChatMessageID = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationID = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderID = table.Column<string>(type: "text", nullable: false),
                    ReceiverID = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.ChatMessageID);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationID",
                        column: x => x.ConversationID,
                        principalSchema: "app",
                        principalTable: "Conversations",
                        principalColumn: "ConversationID",
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
                    BrandDescriptionEN = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    DescriptionEN = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                name: "ContractorApplications",
                schema: "app",
                columns: table => new
                {
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractorID = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    EstimatePrice = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueCommisionTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractorApplications", x => x.ContractorApplicationID);
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                schema: "app",
                columns: table => new
                {
                    PaymentTransactionID = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ItemName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrderCode = table.Column<long>(type: "bigint", nullable: false),
                    CheckoutUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PaymentLinkID = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "ServiceRequests",
                schema: "app",
                columns: table => new
                {
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    Status = table.Column<string>(type: "text", nullable: false),
                    SelectedContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: true),
                    ConversationID = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => x.ServiceRequestID);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_ContractorApplications_SelectedContractorAp~",
                        column: x => x.SelectedContractorApplicationID,
                        principalSchema: "app",
                        principalTable: "ContractorApplications",
                        principalColumn: "ContractorApplicationID");
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Conversations_ConversationID",
                        column: x => x.ConversationID,
                        principalSchema: "app",
                        principalTable: "Conversations",
                        principalColumn: "ConversationID");
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                schema: "app",
                columns: table => new
                {
                    DocumentID = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentUrl = table.Column<string>(type: "text", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uuid", nullable: true),
                    ContractorApplicationID = table.Column<Guid>(type: "uuid", nullable: true),
                    PartnerRequestID = table.Column<Guid>(type: "uuid", nullable: true),
                    PublicId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.DocumentID);
                    table.ForeignKey(
                        name: "FK_Documents_ContractorApplications_ContractorApplicationID",
                        column: x => x.ContractorApplicationID,
                        principalSchema: "app",
                        principalTable: "ContractorApplications",
                        principalColumn: "ContractorApplicationID");
                    table.ForeignKey(
                        name: "FK_Documents_PartnerRequests_PartnerRequestID",
                        column: x => x.PartnerRequestID,
                        principalSchema: "app",
                        principalTable: "PartnerRequests",
                        principalColumn: "PartnerRequestID");
                    table.ForeignKey(
                        name: "FK_Documents_ServiceRequests_ServiceRequestID",
                        column: x => x.ServiceRequestID,
                        principalSchema: "app",
                        principalTable: "ServiceRequests",
                        principalColumn: "ServiceRequestID");
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
                    PartnerRequestID = table.Column<Guid>(type: "uuid", nullable: true),
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
                        name: "FK_Images_PartnerRequests_PartnerRequestID",
                        column: x => x.PartnerRequestID,
                        principalSchema: "app",
                        principalTable: "PartnerRequests",
                        principalColumn: "PartnerRequestID");
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

            migrationBuilder.CreateTable(
                name: "DistributorApplications",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributorID = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistributorApplications", x => x.DistributorApplicationID);
                });

            migrationBuilder.CreateTable(
                name: "MaterialRequests",
                schema: "app",
                columns: table => new
                {
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedDistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CanEditQuantity = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SelectedDistributorApplicationDistributorApplicationID = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialRequests", x => x.MaterialRequestID);
                    table.ForeignKey(
                        name: "FK_MaterialRequests_DistributorApplications_SelectedDistributo~",
                        column: x => x.SelectedDistributorApplicationDistributorApplicationID,
                        principalSchema: "app",
                        principalTable: "DistributorApplications",
                        principalColumn: "DistributorApplicationID");
                });

            migrationBuilder.CreateTable(
                name: "MaterialRequestItems",
                schema: "app",
                columns: table => new
                {
                    MaterialRequestItemID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialRequestItems", x => x.MaterialRequestItemID);
                    table.ForeignKey(
                        name: "FK_MaterialRequestItems_MaterialRequests_MaterialRequestID",
                        column: x => x.MaterialRequestID,
                        principalSchema: "app",
                        principalTable: "MaterialRequests",
                        principalColumn: "MaterialRequestID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaterialRequestItems_Materials_MaterialID",
                        column: x => x.MaterialID,
                        principalSchema: "app",
                        principalTable: "Materials",
                        principalColumn: "MaterialID",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_ChatMessages_ConversationID",
                schema: "app",
                table: "ChatMessages",
                column: "ConversationID");

            migrationBuilder.CreateIndex(
                name: "IX_ContractorApplications_ServiceRequestID",
                schema: "app",
                table: "ContractorApplications",
                column: "ServiceRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ServiceRequestID",
                schema: "app",
                table: "Conversations",
                column: "ServiceRequestID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplications_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications",
                column: "MaterialRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ContractorApplicationID",
                schema: "app",
                table: "Documents",
                column: "ContractorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PartnerRequestID",
                schema: "app",
                table: "Documents",
                column: "PartnerRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ServiceRequestID",
                schema: "app",
                table: "Documents",
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
                name: "IX_Images_PartnerRequestID",
                schema: "app",
                table: "Images",
                column: "PartnerRequestID");

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
                name: "IX_MaterialRequestItems_MaterialID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequestItems_MaterialRequestID",
                schema: "app",
                table: "MaterialRequestItems",
                column: "MaterialRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorA~",
                schema: "app",
                table: "MaterialRequests",
                column: "SelectedDistributorApplicationDistributorApplicationID");

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
                name: "IX_PaymentTransactions_ContractorApplicationID",
                schema: "app",
                table: "PaymentTransactions",
                column: "ContractorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_ConversationID",
                schema: "app",
                table: "ServiceRequests",
                column: "ConversationID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID");

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

            migrationBuilder.AddForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "ContractorApplications",
                column: "ServiceRequestID",
                principalSchema: "app",
                principalTable: "ServiceRequests",
                principalColumn: "ServiceRequestID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DistributorApplications_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications",
                column: "MaterialRequestID",
                principalSchema: "app",
                principalTable: "MaterialRequests",
                principalColumn: "MaterialRequestID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Brands_Images_BrandLogoID",
                schema: "app",
                table: "Brands");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Images_CategoryLogoID",
                schema: "app",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Conversations_ConversationID",
                schema: "app",
                table: "ServiceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ContractorApplications_ServiceRequests_ServiceRequestID",
                schema: "app",
                table: "ContractorApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_DistributorApplications_MaterialRequests_MaterialRequestID",
                schema: "app",
                table: "DistributorApplications");

            migrationBuilder.DropTable(
                name: "ChatMessages",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ContactSupports",
                schema: "app");

            migrationBuilder.DropTable(
                name: "DistributorApplicationItems",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Documents",
                schema: "app");

            migrationBuilder.DropTable(
                name: "MaterialRequestItems",
                schema: "app");

            migrationBuilder.DropTable(
                name: "PaymentTransactions",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Images",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Materials",
                schema: "app");

            migrationBuilder.DropTable(
                name: "PartnerRequests",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Services",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Brands",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "app");

            migrationBuilder.DropTable(
                name: "Conversations",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ServiceRequests",
                schema: "app");

            migrationBuilder.DropTable(
                name: "ContractorApplications",
                schema: "app");

            migrationBuilder.DropTable(
                name: "MaterialRequests",
                schema: "app");

            migrationBuilder.DropTable(
                name: "DistributorApplications",
                schema: "app");
        }
    }
}
