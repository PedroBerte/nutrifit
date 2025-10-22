using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddExercisesTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExerciseCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MuscleGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MuscleGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Instruction = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Exercises_ExerciseCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ExerciseCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Muscles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MuscleGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Muscles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Muscles_MuscleGroups_MuscleGroupId",
                        column: x => x.MuscleGroupId,
                        principalTable: "MuscleGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExercisePrimaryMuscles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MuscleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExerciseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExercisePrimaryMuscles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExercisePrimaryMuscles_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExercisePrimaryMuscles_Muscles_MuscleId",
                        column: x => x.MuscleId,
                        principalTable: "Muscles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExerciseSecondaryMuscles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MuscleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExerciseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseSecondaryMuscles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseSecondaryMuscles_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExerciseSecondaryMuscles_Muscles_MuscleId",
                        column: x => x.MuscleId,
                        principalTable: "Muscles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ExerciseCategories",
                columns: new[] { "Id", "Name", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d"), "Cardio", "A", null },
                    { new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Força", "A", null },
                    { new Guid("c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f"), "Flexibilidade", "A", null },
                    { new Guid("d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a"), "Funcional", "A", null }
                });

            migrationBuilder.InsertData(
                table: "MuscleGroups",
                columns: new[] { "Id", "Name", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d"), "Ombros", "A", null },
                    { new Guid("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"), "Pernas", "A", null },
                    { new Guid("c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f"), "Braços", "A", null },
                    { new Guid("d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a"), "Core", "A", null },
                    { new Guid("e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b"), "Peito", "A", null },
                    { new Guid("f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c"), "Costas", "A", null }
                });

            migrationBuilder.InsertData(
                table: "Exercises",
                columns: new[] { "Id", "CategoryId", "Instruction", "Name", "Status", "UpdatedAt", "Url" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Com a barra no chão, segure-a e levante mantendo as costas retas até ficar em pé.", "Levantamento Terra", "A", null, "https://www.youtube.com/watch?v=ytGaGIn3SjE" },
                    { new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Dê um passo à frente e desça flexionando ambos os joelhos em 90 graus.", "Afundo", "A", null, "https://www.youtube.com/watch?v=QOVaHwm-Q6U" },
                    { new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Segure a barra com as mãos pronadas e puxe o corpo até o queixo passar a barra.", "Barra Fixa", "A", null, "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
                    { new Guid("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Em pé, levante os halteres lateralmente até a altura dos ombros.", "Elevação Lateral", "A", null, "https://www.youtube.com/watch?v=3VcKaXpzqRo" },
                    { new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Sentado, empurre os halteres acima da cabeça até estender os braços completamente.", "Desenvolvimento com Halteres", "A", null, "https://www.youtube.com/watch?v=qEwKCR5JCog" },
                    { new Guid("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Em pé, segure a barra e flexione os cotovelos levando a barra até o peito.", "Rosca Direta", "A", null, "https://www.youtube.com/watch?v=ykJmrZ5v0Oo" },
                    { new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Nas barras paralelas, desça flexionando os cotovelos e empurre para cima.", "Mergulho em Paralelas", "A", null, "https://www.youtube.com/watch?v=2z8JmcrW-As" },
                    { new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Deite-se no banco, pegue a barra com as mãos na largura dos ombros, abaixe até o peito e empurre para cima.", "Supino Reto", "A", null, "https://www.youtube.com/watch?v=rT7DgCr-3pg" },
                    { new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"), new Guid("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e"), "Com os pés na largura dos ombros, desça flexionando os joelhos até as coxas ficarem paralelas ao chão.", "Agachamento Livre", "A", null, "https://www.youtube.com/watch?v=ultWZbUMPL8" },
                    { new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"), new Guid("d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a"), "Apoie-se nos antebraços e pontas dos pés, mantendo o corpo reto por tempo determinado.", "Prancha", "A", null, "https://www.youtube.com/watch?v=ASdvN_XEl_c" }
                });

            migrationBuilder.InsertData(
                table: "Muscles",
                columns: new[] { "Id", "MuscleGroupId", "Name", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("a3b4c5d6-e7f8-6a7b-0c9d-1e2f3a4b5c6d"), new Guid("f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c"), "Latíssimo do Dorso", "A", null },
                    { new Guid("a5b6c7d8-e9f0-8a9b-2c1d-3e4f5a6b7c8d"), new Guid("c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f"), "Antebraços", "A", null },
                    { new Guid("a9b0c1d2-e3f4-2a3b-6c5d-7e8f9a0b1c2d"), new Guid("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"), "Quadríceps", "A", null },
                    { new Guid("b0c1d2e3-f4a5-3b4c-7d6e-8f9a0b1c2d3e"), new Guid("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"), "Isquiotibiais", "A", null },
                    { new Guid("b4c5d6e7-f8a9-7b8c-1d0e-2f3a4b5c6d7e"), new Guid("f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c"), "Trapézio", "A", null },
                    { new Guid("b6c7d8e9-f0a1-9b0c-3d2e-4f5a6b7c8d9e"), new Guid("d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a"), "Abdominais", "A", null },
                    { new Guid("c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f"), new Guid("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"), "Glúteos", "A", null },
                    { new Guid("c5d6e7f8-a9b0-8c9d-2e1f-3a4b5c6d7e8f"), new Guid("f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c"), "Romboides", "A", null },
                    { new Guid("c7d8e9f0-a1b2-0c1d-4e3f-5a6b7c8d9e0f"), new Guid("d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a"), "Oblíquos", "A", null },
                    { new Guid("d2e3f4a5-b6c7-5d6e-9f8a-0b1c2d3e4f5a"), new Guid("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"), "Panturrilhas", "A", null },
                    { new Guid("d6e7f8a9-b0c1-9d0e-3f2a-4b5c6d7e8f9a"), new Guid("a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d"), "Deltoide Anterior", "A", null },
                    { new Guid("d8e9f0a1-b2c3-1d2e-5f4a-6b7c8d9e0f1a"), new Guid("d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a"), "Lombar", "A", null },
                    { new Guid("e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b"), new Guid("e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b"), "Peitoral Maior", "A", null },
                    { new Guid("e3f4a5b6-c7d8-6e7f-0a9b-1c2d3e4f5a6b"), new Guid("c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f"), "Bíceps", "A", null },
                    { new Guid("e7f8a9b0-c1d2-0e1f-4a3b-5c6d7e8f9a0b"), new Guid("a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d"), "Deltoide Lateral", "A", null },
                    { new Guid("f2a3b4c5-d6e7-5f6a-9b8c-0d1e2f3a4b5c"), new Guid("e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b"), "Peitoral Menor", "A", null },
                    { new Guid("f4a5b6c7-d8e9-7f8a-1b0c-2d3e4f5a6b7c"), new Guid("c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f"), "Tríceps", "A", null },
                    { new Guid("f8a9b0c1-d2e3-1f2a-5b4c-6d7e8f9a0b1c"), new Guid("a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d"), "Deltoide Posterior", "A", null }
                });

            migrationBuilder.InsertData(
                table: "ExercisePrimaryMuscles",
                columns: new[] { "Id", "ExerciseId", "MuscleId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"), new Guid("e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b"), "A", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"), new Guid("a9b0c1d2-e3f4-2a3b-6c5d-7e8f9a0b1c2d"), "A", null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"), new Guid("c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f"), "A", null },
                    { new Guid("44444444-4444-4444-4444-444444444444"), new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("d8e9f0a1-b2c3-1d2e-5f4a-6b7c8d9e0f1a"), "A", null },
                    { new Guid("55555555-5555-5555-5555-555555555555"), new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f"), "A", null },
                    { new Guid("66666666-6666-6666-6666-666666666666"), new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("b0c1d2e3-f4a5-3b4c-7d6e-8f9a0b1c2d3e"), "A", null },
                    { new Guid("77777777-7777-7777-7777-777777777777"), new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"), new Guid("a3b4c5d6-e7f8-6a7b-0c9d-1e2f3a4b5c6d"), "A", null },
                    { new Guid("88888888-8888-8888-8888-888888888888"), new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"), new Guid("d6e7f8a9-b0c1-9d0e-3f2a-4b5c6d7e8f9a"), "A", null },
                    { new Guid("99999999-9999-9999-9999-999999999999"), new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"), new Guid("e7f8a9b0-c1d2-0e1f-4a3b-5c6d7e8f9a0b"), "A", null },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new Guid("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f"), new Guid("e3f4a5b6-c7d8-6e7f-0a9b-1c2d3e4f5a6b"), "A", null },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"), new Guid("f4a5b6c7-d8e9-7f8a-1b0c-2d3e4f5a6b7c"), "A", null },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"), new Guid("b6c7d8e9-f0a1-9b0c-3d2e-4f5a6b7c8d9e"), "A", null },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"), new Guid("a9b0c1d2-e3f4-2a3b-6c5d-7e8f9a0b1c2d"), "A", null },
                    { new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"), new Guid("c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f"), "A", null },
                    { new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff"), new Guid("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d"), new Guid("e7f8a9b0-c1d2-0e1f-4a3b-5c6d7e8f9a0b"), "A", null }
                });

            migrationBuilder.InsertData(
                table: "ExerciseSecondaryMuscles",
                columns: new[] { "Id", "ExerciseId", "MuscleId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"), new Guid("f4a5b6c7-d8e9-7f8a-1b0c-2d3e4f5a6b7c"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a"), new Guid("d6e7f8a9-b0c1-9d0e-3f2a-4b5c6d7e8f9a"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"), new Guid("b0c1d2e3-f4a5-3b4c-7d6e-8f9a0b1c2d3e"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b"), new Guid("d8e9f0a1-b2c3-1d2e-5f4a-6b7c8d9e0f1a"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("b4c5d6e7-f8a9-7b8c-1d0e-2f3a4b5c6d7e"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000006"), new Guid("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c"), new Guid("a9b0c1d2-e3f4-2a3b-6c5d-7e8f9a0b1c2d"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000007"), new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"), new Guid("e3f4a5b6-c7d8-6e7f-0a9b-1c2d3e4f5a6b"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000008"), new Guid("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d"), new Guid("b4c5d6e7-f8a9-7b8c-1d0e-2f3a4b5c6d7e"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000009"), new Guid("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e"), new Guid("f4a5b6c7-d8e9-7f8a-1b0c-2d3e4f5a6b7c"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000a"), new Guid("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f"), new Guid("a5b6c7d8-e9f0-8a9b-2c1d-3e4f5a6b7c8d"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000b"), new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"), new Guid("e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000c"), new Guid("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a"), new Guid("d6e7f8a9-b0c1-9d0e-3f2a-4b5c6d7e8f9a"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000d"), new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"), new Guid("d8e9f0a1-b2c3-1d2e-5f4a-6b7c8d9e0f1a"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000e"), new Guid("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b"), new Guid("c7d8e9f0-a1b2-0c1d-4e3f-5a6b7c8d9e0f"), "A", null },
                    { new Guid("10000000-0000-0000-0000-00000000000f"), new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"), new Guid("b0c1d2e3-f4a5-3b4c-7d6e-8f9a0b1c2d3e"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000010"), new Guid("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c"), new Guid("d2e3f4a5-b6c7-5d6e-9f8a-0b1c2d3e4f5a"), "A", null },
                    { new Guid("10000000-0000-0000-0000-000000000011"), new Guid("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d"), new Guid("b4c5d6e7-f8a9-7b8c-1d0e-2f3a4b5c6d7e"), "A", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExercisePrimaryMuscles_ExerciseId_MuscleId",
                table: "ExercisePrimaryMuscles",
                columns: new[] { "ExerciseId", "MuscleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExercisePrimaryMuscles_MuscleId",
                table: "ExercisePrimaryMuscles",
                column: "MuscleId");

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CategoryId",
                table: "Exercises",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseSecondaryMuscles_ExerciseId_MuscleId",
                table: "ExerciseSecondaryMuscles",
                columns: new[] { "ExerciseId", "MuscleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseSecondaryMuscles_MuscleId",
                table: "ExerciseSecondaryMuscles",
                column: "MuscleId");

            migrationBuilder.CreateIndex(
                name: "IX_Muscles_MuscleGroupId",
                table: "Muscles",
                column: "MuscleGroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExercisePrimaryMuscles");

            migrationBuilder.DropTable(
                name: "ExerciseSecondaryMuscles");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "Muscles");

            migrationBuilder.DropTable(
                name: "ExerciseCategories");

            migrationBuilder.DropTable(
                name: "MuscleGroups");
        }
    }
}
