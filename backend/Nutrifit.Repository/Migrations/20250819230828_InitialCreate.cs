using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressLine = table.Column<string>(type: "text", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: false),
                    State = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: false),
                    AddressType = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Profile",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profile", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Password = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    AddressId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    ProfileId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                    table.ForeignKey(
                        name: "FK_User_Address_AddressId",
                        column: x => x.AddressId,
                        principalTable: "Address",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_User_Address_AddressId1",
                        column: x => x.AddressId1,
                        principalTable: "Address",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_User_Profile_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_User_Profile_ProfileId1",
                        column: x => x.ProfileId1,
                        principalTable: "Profile",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProfileRole",
                columns: table => new
                {
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileRole", x => new { x.RoleId, x.ProfileId });
                    table.ForeignKey(
                        name: "FK_ProfileRole_Profile_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileRole_Profile_ProfileId1",
                        column: x => x.ProfileId1,
                        principalTable: "Profile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileRole_Role_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileRole_Role_RoleId1",
                        column: x => x.RoleId1,
                        principalTable: "Role",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomerFeedback",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Testimony = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Rate = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ProfessionalId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerFeedback", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerFeedback_User_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerFeedback_User_CustomerId1",
                        column: x => x.CustomerId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerFeedback_User_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerFeedback_User_ProfessionalId1",
                        column: x => x.ProfessionalId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomerProfessionalBond",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CustomerId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerProfessionalBond", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_CustomerId1",
                        column: x => x.CustomerId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_ProfessionalId1",
                        column: x => x.ProfessionalId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_SenderId",
                        column: x => x.SenderId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBond_User_SenderId1",
                        column: x => x.SenderId1,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalCredential",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Value = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ProfessionalId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalCredential", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalCredential_User_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalCredential_User_ProfessionalId1",
                        column: x => x.ProfessionalId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalFeedback",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Testimony = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Rate = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ProfessionalId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalFeedback", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedback_User_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedback_User_CustomerId1",
                        column: x => x.CustomerId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedback_User_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedback_User_ProfessionalId1",
                        column: x => x.ProfessionalId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfile",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId1 = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfile", x => new { x.UserId, x.ProfileId });
                    table.ForeignKey(
                        name: "FK_UserProfile_Profile_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProfile_Profile_ProfileId1",
                        column: x => x.ProfileId1,
                        principalTable: "Profile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProfile_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProfile_User_UserId1",
                        column: x => x.UserId1,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerProfessionalBondId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CustomerProfessionalBondId1 = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalBo~",
                        column: x => x.CustomerProfessionalBondId,
                        principalTable: "CustomerProfessionalBond",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalB~1",
                        column: x => x.CustomerProfessionalBondId1,
                        principalTable: "CustomerProfessionalBond",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointment_CustomerProfessionalBondId",
                table: "Appointment",
                column: "CustomerProfessionalBondId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointment_CustomerProfessionalBondId1",
                table: "Appointment",
                column: "CustomerProfessionalBondId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_CustomerId",
                table: "CustomerFeedback",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_CustomerId1",
                table: "CustomerFeedback",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_ProfessionalId",
                table: "CustomerFeedback",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_ProfessionalId1",
                table: "CustomerFeedback",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_CustomerId",
                table: "CustomerProfessionalBond",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_CustomerId1",
                table: "CustomerProfessionalBond",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_ProfessionalId",
                table: "CustomerProfessionalBond",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_ProfessionalId1",
                table: "CustomerProfessionalBond",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_SenderId",
                table: "CustomerProfessionalBond",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_SenderId1",
                table: "CustomerProfessionalBond",
                column: "SenderId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredential_ProfessionalId",
                table: "ProfessionalCredential",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredential_ProfessionalId1",
                table: "ProfessionalCredential",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_CustomerId",
                table: "ProfessionalFeedback",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_CustomerId1",
                table: "ProfessionalFeedback",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_ProfessionalId",
                table: "ProfessionalFeedback",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_ProfessionalId1",
                table: "ProfessionalFeedback",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileRole_ProfileId",
                table: "ProfileRole",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileRole_ProfileId1",
                table: "ProfileRole",
                column: "ProfileId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileRole_RoleId1",
                table: "ProfileRole",
                column: "RoleId1");

            migrationBuilder.CreateIndex(
                name: "IX_User_AddressId",
                table: "User",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_User_AddressId1",
                table: "User",
                column: "AddressId1");

            migrationBuilder.CreateIndex(
                name: "IX_User_ProfileId",
                table: "User",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_User_ProfileId1",
                table: "User",
                column: "ProfileId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfile_ProfileId",
                table: "UserProfile",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfile_ProfileId1",
                table: "UserProfile",
                column: "ProfileId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfile_UserId1",
                table: "UserProfile",
                column: "UserId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointment");

            migrationBuilder.DropTable(
                name: "CustomerFeedback");

            migrationBuilder.DropTable(
                name: "ProfessionalCredential");

            migrationBuilder.DropTable(
                name: "ProfessionalFeedback");

            migrationBuilder.DropTable(
                name: "ProfileRole");

            migrationBuilder.DropTable(
                name: "UserProfile");

            migrationBuilder.DropTable(
                name: "CustomerProfessionalBond");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropTable(
                name: "Profile");
        }
    }
}
