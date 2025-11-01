using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RemovingUrlFromExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Url",
                table: "Exercises");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "Exercises",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=ytGaGIn3SjE");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=QOVaHwm-Q6U");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=eGo4IYlbE5g");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=3VcKaXpzqRo");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=qEwKCR5JCog");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=2z8JmcrW-As");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=rT7DgCr-3pg");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=ultWZbUMPL8");

            migrationBuilder.UpdateData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"),
                column: "Url",
                value: "https://www.youtube.com/watch?v=ASdvN_XEl_c");
        }
    }
}
