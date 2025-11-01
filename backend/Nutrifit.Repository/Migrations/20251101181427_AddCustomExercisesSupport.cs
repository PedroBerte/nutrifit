using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomExercisesSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Exercises",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Exercises",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Exercises",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"),
                columns: new[] { "CreatedByUserId", "ImageUrl" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CreatedByUserId",
                table: "Exercises",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_Users_CreatedByUserId",
                table: "Exercises",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_Users_CreatedByUserId",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_CreatedByUserId",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Exercises");
        }
    }
}
