using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppointmentEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Appointments",
                newName: "ScheduledAt");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Appointments",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "AddressId",
                table: "Appointments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AddressId",
                table: "Appointments",
                column: "AddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Addresses_AddressId",
                table: "Appointments",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Addresses_AddressId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_AddressId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AddressId",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "ScheduledAt",
                table: "Appointments",
                newName: "Date");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Appointments",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Appointments",
                type: "text",
                nullable: true);
        }
    }
}
