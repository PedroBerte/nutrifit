using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseTemplateBisetAndSetMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBisetWithPrevious",
                table: "ExerciseTemplates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SetType",
                table: "ExerciseTemplates",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Reps");

            migrationBuilder.AddColumn<int>(
                name: "TargetCalories",
                table: "ExerciseTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TargetDurationSeconds",
                table: "ExerciseTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeightUnit",
                table: "ExerciseTemplates",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "kg");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBisetWithPrevious",
                table: "ExerciseTemplates");

            migrationBuilder.DropColumn(
                name: "SetType",
                table: "ExerciseTemplates");

            migrationBuilder.DropColumn(
                name: "TargetCalories",
                table: "ExerciseTemplates");

            migrationBuilder.DropColumn(
                name: "TargetDurationSeconds",
                table: "ExerciseTemplates");

            migrationBuilder.DropColumn(
                name: "WeightUnit",
                table: "ExerciseTemplates");
        }
    }
}
