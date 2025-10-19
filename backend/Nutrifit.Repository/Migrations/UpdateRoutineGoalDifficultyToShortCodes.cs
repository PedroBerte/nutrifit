using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nutrifit.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoutineGoalDifficultyToShortCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Atualizar os dados existentes de Goal (objetivo)
            migrationBuilder.Sql(@"
                UPDATE ""Routines"" 
                SET ""Goal"" = CASE 
                    WHEN ""Goal"" = 'Hipertrofia' THEN 'HYP'
                    WHEN ""Goal"" = 'Emagrecimento' THEN 'WLS'
                    WHEN ""Goal"" = 'Definição' OR ""Goal"" = 'Definicao' THEN 'DEF'
                    WHEN ""Goal"" = 'Condicionamento' THEN 'CON'
                    WHEN ""Goal"" = 'Força' OR ""Goal"" = 'Forca' THEN 'STR'
                    WHEN ""Goal"" = 'Resistência' OR ""Goal"" = 'Resistencia' THEN 'END'
                    ELSE ""Goal""
                END
                WHERE ""Goal"" IS NOT NULL;
            ");

            // Atualizar os dados existentes de Difficulty (dificuldade)
            migrationBuilder.Sql(@"
                UPDATE ""Routines"" 
                SET ""Difficulty"" = CASE 
                    WHEN ""Difficulty"" = 'Iniciante' THEN 'BEG'
                    WHEN ""Difficulty"" = 'Intermediário' OR ""Difficulty"" = 'Intermediario' THEN 'INT'
                    WHEN ""Difficulty"" = 'Avançado' OR ""Difficulty"" = 'Avancado' THEN 'ADV'
                    ELSE ""Difficulty""
                END
                WHERE ""Difficulty"" IS NOT NULL;
            ");

            // Alterar o tamanho máximo das colunas
            migrationBuilder.AlterColumn<string>(
                name: "Goal",
                table: "Routines",
                type: "character varying(3)",
                maxLength: 3,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Difficulty",
                table: "Routines",
                type: "character varying(3)",
                maxLength: 3,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverter o tamanho das colunas
            migrationBuilder.AlterColumn<string>(
                name: "Goal",
                table: "Routines",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Difficulty",
                table: "Routines",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3,
                oldNullable: true);

            // Reverter os dados de Goal
            migrationBuilder.Sql(@"
                UPDATE ""Routines"" 
                SET ""Goal"" = CASE 
                    WHEN ""Goal"" = 'HYP' THEN 'Hipertrofia'
                    WHEN ""Goal"" = 'WLS' THEN 'Emagrecimento'
                    WHEN ""Goal"" = 'DEF' THEN 'Definição'
                    WHEN ""Goal"" = 'CON' THEN 'Condicionamento'
                    WHEN ""Goal"" = 'STR' THEN 'Força'
                    WHEN ""Goal"" = 'END' THEN 'Resistência'
                    ELSE ""Goal""
                END
                WHERE ""Goal"" IS NOT NULL;
            ");

            // Reverter os dados de Difficulty
            migrationBuilder.Sql(@"
                UPDATE ""Routines"" 
                SET ""Difficulty"" = CASE 
                    WHEN ""Difficulty"" = 'BEG' THEN 'Iniciante'
                    WHEN ""Difficulty"" = 'INT' THEN 'Intermediário'
                    WHEN ""Difficulty"" = 'ADV' THEN 'Avançado'
                    ELSE ""Difficulty""
                END
                WHERE ""Difficulty"" IS NOT NULL;
            ");
        }
    }
}
