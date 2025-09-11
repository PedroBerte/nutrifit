using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class FkFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalB~1",
                table: "Appointment");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerFeedback_User_CustomerId1",
                table: "CustomerFeedback");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerFeedback_User_ProfessionalId1",
                table: "CustomerFeedback");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBond_User_CustomerId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBond_User_ProfessionalId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerProfessionalBond_User_SenderId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfessionalCredential_User_ProfessionalId1",
                table: "ProfessionalCredential");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfessionalFeedback_User_CustomerId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfessionalFeedback_User_ProfessionalId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropIndex(
                name: "IX_ProfessionalFeedback_CustomerId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropIndex(
                name: "IX_ProfessionalFeedback_ProfessionalId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropIndex(
                name: "IX_ProfessionalCredential_ProfessionalId1",
                table: "ProfessionalCredential");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfessionalBond_CustomerId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfessionalBond_ProfessionalId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfessionalBond_SenderId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropIndex(
                name: "IX_CustomerFeedback_CustomerId1",
                table: "CustomerFeedback");

            migrationBuilder.DropIndex(
                name: "IX_CustomerFeedback_ProfessionalId1",
                table: "CustomerFeedback");

            migrationBuilder.DropColumn(
                name: "CustomerId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropColumn(
                name: "ProfessionalId1",
                table: "ProfessionalFeedback");

            migrationBuilder.DropColumn(
                name: "ProfessionalId1",
                table: "ProfessionalCredential");

            migrationBuilder.DropColumn(
                name: "CustomerId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropColumn(
                name: "ProfessionalId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropColumn(
                name: "SenderId1",
                table: "CustomerProfessionalBond");

            migrationBuilder.DropColumn(
                name: "CustomerId1",
                table: "CustomerFeedback");

            migrationBuilder.DropColumn(
                name: "ProfessionalId1",
                table: "CustomerFeedback");

            migrationBuilder.AlterColumn<Guid>(
                name: "CustomerProfessionalBondId1",
                table: "Appointment",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalB~1",
                table: "Appointment",
                column: "CustomerProfessionalBondId1",
                principalTable: "CustomerProfessionalBond",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalB~1",
                table: "Appointment");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId1",
                table: "ProfessionalFeedback",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProfessionalId1",
                table: "ProfessionalFeedback",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProfessionalId1",
                table: "ProfessionalCredential",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId1",
                table: "CustomerProfessionalBond",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProfessionalId1",
                table: "CustomerProfessionalBond",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SenderId1",
                table: "CustomerProfessionalBond",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId1",
                table: "CustomerFeedback",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProfessionalId1",
                table: "CustomerFeedback",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "CustomerProfessionalBondId1",
                table: "Appointment",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_CustomerId1",
                table: "ProfessionalFeedback",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalFeedback_ProfessionalId1",
                table: "ProfessionalFeedback",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalCredential_ProfessionalId1",
                table: "ProfessionalCredential",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_CustomerId1",
                table: "CustomerProfessionalBond",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_ProfessionalId1",
                table: "CustomerProfessionalBond",
                column: "ProfessionalId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfessionalBond_SenderId1",
                table: "CustomerProfessionalBond",
                column: "SenderId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_CustomerId1",
                table: "CustomerFeedback",
                column: "CustomerId1");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedback_ProfessionalId1",
                table: "CustomerFeedback",
                column: "ProfessionalId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointment_CustomerProfessionalBond_CustomerProfessionalB~1",
                table: "Appointment",
                column: "CustomerProfessionalBondId1",
                principalTable: "CustomerProfessionalBond",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerFeedback_User_CustomerId1",
                table: "CustomerFeedback",
                column: "CustomerId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerFeedback_User_ProfessionalId1",
                table: "CustomerFeedback",
                column: "ProfessionalId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBond_User_CustomerId1",
                table: "CustomerProfessionalBond",
                column: "CustomerId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBond_User_ProfessionalId1",
                table: "CustomerProfessionalBond",
                column: "ProfessionalId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerProfessionalBond_User_SenderId1",
                table: "CustomerProfessionalBond",
                column: "SenderId1",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessionalCredential_User_ProfessionalId1",
                table: "ProfessionalCredential",
                column: "ProfessionalId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessionalFeedback_User_CustomerId1",
                table: "ProfessionalFeedback",
                column: "CustomerId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfessionalFeedback_User_ProfessionalId1",
                table: "ProfessionalFeedback",
                column: "ProfessionalId1",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
