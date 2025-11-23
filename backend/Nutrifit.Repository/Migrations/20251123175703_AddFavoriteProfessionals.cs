using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoriteProfessionals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FavoriteProfessionals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteProfessionals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteProfessionals_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FavoriteProfessionals_Users_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteProfessionals_CustomerId_ProfessionalId",
                table: "FavoriteProfessionals",
                columns: new[] { "CustomerId", "ProfessionalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteProfessionals_ProfessionalId",
                table: "FavoriteProfessionals",
                column: "ProfessionalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteProfessionals");
        }
    }
}
