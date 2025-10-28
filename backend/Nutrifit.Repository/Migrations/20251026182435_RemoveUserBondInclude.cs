using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserBondInclude : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_CustomerId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_ProfessionalId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_SenderId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_CustomerId",
                table: "CustomerProfessionalBonds",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_ProfessionalId",
                table: "CustomerProfessionalBonds",
                column: "ProfessionalId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_SenderId",
                table: "CustomerProfessionalBonds",
                column: "SenderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_CustomerId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_ProfessionalId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_SenderId",
                table: "CustomerProfessionalBonds");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_CustomerId",
                table: "CustomerProfessionalBonds",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_ProfessionalId",
                table: "CustomerProfessionalBonds",
                column: "ProfessionalId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBonds_Users_SenderId",
                table: "CustomerProfessionalBonds",
                column: "SenderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
