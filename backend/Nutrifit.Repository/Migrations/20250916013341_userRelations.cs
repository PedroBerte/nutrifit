using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class userRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProfessionalCredential_ProfessionalId",
                table: "ProfessionalCredential");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "CustomerProfessionalBond",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "CustomerFeedback",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredential_ProfessionalId",
                table: "ProfessionalCredential",
                column: "ProfessionalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_UserId",
                table: "CustomerProfessionalBond",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_UserId",
                table: "CustomerFeedback",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerFeedback_User_UserId",
                table: "CustomerFeedback",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBond_User_UserId",
                table: "CustomerProfessionalBond",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerFeedback_User_UserId",
                table: "CustomerFeedback");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBond_User_UserId",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropIndex(
                name: "IX_User_Email",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_ProfessionalCredential_ProfessionalId",
                table: "ProfessionalCredential");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfessionalBond_UserId",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropIndex(
                name: "IX_CustomerFeedback_UserId",
                table: "CustomerFeedback");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CustomerFeedback");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredential_ProfessionalId",
                table: "ProfessionalCredential",
                column: "ProfessionalId");
        }
    }
}
