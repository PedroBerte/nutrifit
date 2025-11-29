using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RenameImageUrlToVideoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Exercises",
                newName: "VideoUrl");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VideoUrl",
                table: "Exercises",
                newName: "ImageUrl");
        }
    }
}
