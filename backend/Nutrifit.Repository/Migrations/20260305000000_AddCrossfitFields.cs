using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCrossfitFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ExerciseTemplates: SetType, WeightUnit, IsBisetWithPrevious, TargetDurationSeconds, TargetCalories
            migrationBuilder.AddColumn<string>(
                name: "SetType",
                table: "ExerciseTemplates",
                type: "text",
                nullable: false,
                defaultValue: "Reps");

            migrationBuilder.AddColumn<string>(
                name: "WeightUnit",
                table: "ExerciseTemplates",
                type: "text",
                nullable: false,
                defaultValue: "kg");

            migrationBuilder.AddColumn<bool>(
                name: "IsBisetWithPrevious",
                table: "ExerciseTemplates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TargetDurationSeconds",
                table: "ExerciseTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TargetCalories",
                table: "ExerciseTemplates",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            // SetSessions: DurationSeconds, Calories
            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "SetSessions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Calories",
                table: "SetSessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "SetType", table: "ExerciseTemplates");
            migrationBuilder.DropColumn(name: "WeightUnit", table: "ExerciseTemplates");
            migrationBuilder.DropColumn(name: "IsBisetWithPrevious", table: "ExerciseTemplates");
            migrationBuilder.DropColumn(name: "TargetDurationSeconds", table: "ExerciseTemplates");
            migrationBuilder.DropColumn(name: "TargetCalories", table: "ExerciseTemplates");
            migrationBuilder.DropColumn(name: "DurationSeconds", table: "SetSessions");
            migrationBuilder.DropColumn(name: "Calories", table: "SetSessions");
        }
    }
}
