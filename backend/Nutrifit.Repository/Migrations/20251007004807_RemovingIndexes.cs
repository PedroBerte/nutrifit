using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RemovingIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_push_subscriptions_Endpoint",
                table: "push_subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_push_subscriptions_UserId_Endpoint",
                table: "push_subscriptions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_push_subscriptions_Endpoint",
                table: "push_subscriptions",
                column: "Endpoint",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_push_subscriptions_UserId_Endpoint",
                table: "push_subscriptions",
                columns: new[] { "UserId", "Endpoint" },
                unique: true);
        }
    }
}
