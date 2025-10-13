using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class FkFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessional~",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessiona~1",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_CustomerProfessionalBondEntityId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "CustomerProfessionalBondEntityId",
                table: "Appointments");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessional~",
                table: "Appointments",
                column: "CustomerProfessionalBondId",
                principalTable: "CustomerProfessionalBonds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessional~",
                table: "Appointments");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerProfessionalBondEntityId",
                table: "Appointments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CustomerProfessionalBondEntityId",
                table: "Appointments",
                column: "CustomerProfessionalBondEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessional~",
                table: "Appointments",
                column: "CustomerProfessionalBondEntityId",
                principalTable: "CustomerProfessionalBonds",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_CustomerProfessionalBonds_CustomerProfessiona~1",
                table: "Appointments",
                column: "CustomerProfessionalBondId",
                principalTable: "CustomerProfessionalBonds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
