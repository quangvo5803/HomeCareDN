using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Application
{
    /// <inheritdoc />
    public partial class InitApplicationDatabase : Migration
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsProcessed = table.Column<bool>(type: "bit", nullable: false),
                    ReplyContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReplyBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ConversationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContractorID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AdminID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConversationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdminRead = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.ConversationID);
                });

            migrationBuilder.CreateTable(
                name: "PartnerRequests",
                schema: "app",
                columns: table => new
                {
                    PartnerRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartnerRequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ServiceID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PackageOption = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuildingType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MainStructureType = table.Column<int>(type: "int", nullable: true),
                    DesignStyle = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ChatMessageID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReceiverID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsAdminRead = table.Column<bool>(type: "bit", nullable: false)
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
                    BrandID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BrandName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandLogoID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BrandNameEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandDescriptionEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryNameEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryLogoID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    MaterialID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEN = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    BrandID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UnitEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    ContractorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractorID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatePrice = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueCommisionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    PaymentTransactionID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OrderCode = table.Column<long>(type: "bigint", nullable: false),
                    CheckoutUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PaymentLinkID = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.PaymentTransactionID);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_ContractorApplications_ContractorApplicationID",
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
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PackageOption = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BuildingType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MainStructureType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DesignStyle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Width = table.Column<double>(type: "float", nullable: false),
                    Length = table.Column<double>(type: "float", nullable: false),
                    Floors = table.Column<int>(type: "int", nullable: false),
                    EstimatePrice = table.Column<double>(type: "float", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SelectedContractorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConversationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => x.ServiceRequestID);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_ContractorApplications_SelectedContractorApplicationID",
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
                    DocumentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContractorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PartnerRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PublicId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_Documents_Services_ServiceID",
                        column: x => x.ServiceID,
                        principalSchema: "app",
                        principalTable: "Services",
                        principalColumn: "ServiceID");
                });

            migrationBuilder.CreateTable(
                name: "DistributorApplicationItems",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationItemID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DistributorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Price = table.Column<double>(type: "float", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistributorApplicationItems", x => x.DistributorApplicationItemID);
                    table.ForeignKey(
                        name: "FK_DistributorApplicationItems_Materials_MaterialID",
                        column: x => x.MaterialID,
                        principalSchema: "app",
                        principalTable: "Materials",
                        principalColumn: "MaterialID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DistributorApplications",
                schema: "app",
                columns: table => new
                {
                    DistributorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DistributorID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DueCommisionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalEstimatePrice = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
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
                    MaterialRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SelectedDistributorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CanEditQuantity = table.Column<bool>(type: "bit", nullable: false),
                    CanAddMaterial = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SelectedDistributorApplicationDistributorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialRequests", x => x.MaterialRequestID);
                    table.ForeignKey(
                        name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
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
                    MaterialRequestItemID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaterialRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "Review",
                schema: "app",
                columns: table => new
                {
                    ReviewID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MaterialRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PartnerID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rating = table.Column<int>(type: "int", maxLength: 5, nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Review", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK_Review_MaterialRequests_MaterialRequestID",
                        column: x => x.MaterialRequestID,
                        principalSchema: "app",
                        principalTable: "MaterialRequests",
                        principalColumn: "MaterialRequestID");
                    table.ForeignKey(
                        name: "FK_Review_ServiceRequests_ServiceRequestID",
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
                    ImageID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaterialID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ServiceRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ServiceID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ContractorApplicationID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BrandID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CategoryID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PartnerRequestID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PublicId = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                        name: "FK_Images_Review_ReviewID",
                        column: x => x.ReviewID,
                        principalSchema: "app",
                        principalTable: "Review",
                        principalColumn: "ReviewID");
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
                unique: true,
                filter: "[ServiceRequestID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplicationItems_DistributorApplicationID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "DistributorApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_DistributorApplicationItems_MaterialID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "MaterialID");

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
                name: "IX_Documents_ServiceID",
                schema: "app",
                table: "Documents",
                column: "ServiceID");

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
                name: "IX_Images_ReviewID",
                schema: "app",
                table: "Images",
                column: "ReviewID");

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
                name: "IX_MaterialRequests_SelectedDistributorApplicationDistributorApplicationID",
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
                name: "IX_Review_MaterialRequestID",
                schema: "app",
                table: "Review",
                column: "MaterialRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_Review_ServiceRequestID",
                schema: "app",
                table: "Review",
                column: "ServiceRequestID",
                unique: true,
                filter: "[ServiceRequestID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_ConversationID",
                schema: "app",
                table: "ServiceRequests",
                column: "ConversationID",
                unique: true,
                filter: "[ConversationID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_SelectedContractorApplicationID",
                schema: "app",
                table: "ServiceRequests",
                column: "SelectedContractorApplicationID",
                unique: true,
                filter: "[SelectedContractorApplicationID] IS NOT NULL");

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
                name: "FK_DistributorApplicationItems_DistributorApplications_DistributorApplicationID",
                schema: "app",
                table: "DistributorApplicationItems",
                column: "DistributorApplicationID",
                principalSchema: "app",
                principalTable: "DistributorApplications",
                principalColumn: "DistributorApplicationID",
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
                name: "FK_MaterialRequests_DistributorApplications_SelectedDistributorApplicationDistributorApplicationID",
                schema: "app",
                table: "MaterialRequests");

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
                name: "Review",
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
                name: "DistributorApplications",
                schema: "app");

            migrationBuilder.DropTable(
                name: "MaterialRequests",
                schema: "app");
        }
    }
}
