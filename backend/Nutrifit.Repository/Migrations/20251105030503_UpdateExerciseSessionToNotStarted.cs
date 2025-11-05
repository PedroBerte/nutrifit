using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExerciseSessionToNotStarted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ExerciseSessions",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "NS",
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2,
                oldDefaultValue: "IP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartedAt",
                table: "ExerciseSessions",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ExerciseSessions",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "IP",
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2,
                oldDefaultValue: "NS");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartedAt",
                table: "ExerciseSessions",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);
        }
    }
}
