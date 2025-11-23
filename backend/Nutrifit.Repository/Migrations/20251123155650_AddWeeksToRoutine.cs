using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddWeeksToRoutine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Weeks",
                table: "Routines",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Weeks",
                table: "Routines");
        }
    }
}
