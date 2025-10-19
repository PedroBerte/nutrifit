namespace Nutrifit.Services.Constants;

public static class RoutineConstants
{
    public static class Goal
    {
        public const string Hypertrophy = "HYP";      // Hipertrofia
        public const string WeightLoss = "WLS";       // Emagrecimento
        public const string Definition = "DEF";       // Definição
        public const string Conditioning = "CON";     // Condicionamento
        public const string Strength = "STR";         // Força
        public const string Endurance = "END";        // Resistência

        public static readonly Dictionary<string, string> Labels = new()
        {
            { Hypertrophy, "Hipertrofia" },
            { WeightLoss, "Emagrecimento" },
            { Definition, "Definição" },
            { Conditioning, "Condicionamento" },
            { Strength, "Força" },
            { Endurance, "Resistência" }
        };

        public static string GetLabel(string? code)
        {
            if (string.IsNullOrEmpty(code)) return "";
            return Labels.ContainsKey(code) ? Labels[code] : code;
        }

        public static bool IsValid(string? code)
        {
            if (string.IsNullOrEmpty(code)) return true;
            return Labels.ContainsKey(code);
        }
    }

    public static class Difficulty
    {
        public const string Beginner = "BEG";         // Iniciante
        public const string Intermediate = "INT";     // Intermediário
        public const string Advanced = "ADV";         // Avançado

        public static readonly Dictionary<string, string> Labels = new()
        {
            { Beginner, "Iniciante" },
            { Intermediate, "Intermediário" },
            { Advanced, "Avançado" }
        };

        public static string GetLabel(string? code)
        {
            if (string.IsNullOrEmpty(code)) return "";
            return Labels.ContainsKey(code) ? Labels[code] : code;
        }

        public static bool IsValid(string? code)
        {
            if (string.IsNullOrEmpty(code)) return true;
            return Labels.ContainsKey(code);
        }
    }
}
