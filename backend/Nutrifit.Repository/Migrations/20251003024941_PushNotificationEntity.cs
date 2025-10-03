using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class PushNotificationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "push_subscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Endpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    P256dh = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Auth = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ExpirationTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_push_subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_push_subscriptions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_push_subscriptions_Endpoint",
                table: "push_subscriptions",
                column: "Endpoint",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_push_subscriptions_UserId",
                table: "push_subscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_push_subscriptions_UserId_IsActive",
                table: "push_subscriptions",
                columns: new[] { "UserId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "push_subscriptions");
        }
    }
}
