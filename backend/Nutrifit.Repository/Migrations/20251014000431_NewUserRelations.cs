using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class NewUserRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_UserEntityId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfessionalBonds_UserEntityId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropColumn(
                name: "UserEntityId",
                table: "CustomerProfessionalBonds");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserEntityId",
                table: "CustomerProfessionalBonds",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBonds_UserEntityId",
                table: "CustomerProfessionalBonds",
                column: "UserEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_UserEntityId",
                table: "CustomerProfessionalBonds",
                column: "UserEntityId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
