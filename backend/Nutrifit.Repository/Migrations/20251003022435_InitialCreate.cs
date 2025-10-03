using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

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
                name: "Addresses",
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Sex = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Addresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomerFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    Testimony = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Rate = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    UserEntityId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerFeedbacks_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerFeedbacks_Users_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerFeedbacks_Users_UserEntityId",
                        column: x => x.UserEntityId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CustomerProfessionalBonds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    UserEntityId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerProfessionalBonds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBonds_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBonds_Users_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBonds_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerProfessionalBonds_Users_UserEntityId",
                        column: x => x.UserEntityId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalCredentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    CredentialId = table.Column<string>(type: "text", nullable: true),
                    Biography = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalCredentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalCredentials_Users_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    Testimony = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Rate = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedbacks_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfessionalFeedbacks_Users_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerProfessionalBondId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CustomerProfessionalBondEntityId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessional~",
                        column: x => x.CustomerProfessionalBondEntityId,
                        principalTable: "CustomerProfessionalBonds",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessiona~1",
                        column: x => x.CustomerProfessionalBondId,
                        principalTable: "CustomerProfessionalBonds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Profiles",
                columns: new[] { "Id", "Name", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("ad07405b-cdf2-4780-8a0e-69323be32a6c"), "Personal", "A", null },
                    { new Guid("eff474b5-ce49-42d5-84da-d9c904b721a1"), "Nutricionista", "A", null },
                    { new Guid("ff35132f-d761-40e6-9e05-f5ed30c0063d"), "Estudante", "A", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CustomerProfessionalBondEntityId",
                table: "Appointments",
                column: "CustomerProfessionalBondEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CustomerProfessionalBondId",
                table: "Appointments",
                column: "CustomerProfessionalBondId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedbacks_CustomerId",
                table: "CustomerFeedbacks",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedbacks_ProfessionalId",
                table: "CustomerFeedbacks",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedbacks_UserEntityId",
                table: "CustomerFeedbacks",
                column: "UserEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBonds_CustomerId",
                table: "CustomerProfessionalBonds",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBonds_ProfessionalId",
                table: "CustomerProfessionalBonds",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBonds_SenderId",
                table: "CustomerProfessionalBonds",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBonds_UserEntityId",
                table: "CustomerProfessionalBonds",
                column: "UserEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredentials_ProfessionalId",
                table: "ProfessionalCredentials",
                column: "ProfessionalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedbacks_CustomerId",
                table: "ProfessionalFeedbacks",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedbacks_ProfessionalId",
                table: "ProfessionalFeedbacks",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_AddressId",
                table: "Users",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ProfileId",
                table: "Users",
                column: "ProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "CustomerFeedbacks");

            migrationBuilder.DropTable(
                name: "ProfessionalCredentials");

            migrationBuilder.DropTable(
                name: "ProfessionalFeedbacks");

            migrationBuilder.DropTable(
                name: "CustomerProfessionalBonds");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Profiles");
        }
    }
}
