using System.ComponentModel.DataAnnotations;
using Nutrifit.Services.Constants;

namespace Nutrifit.Services.ViewModel.Request;

public class CreateRoutineRequest
{
    [Required(ErrorMessage = "T�tulo � obrigat�rio")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(3)]
    public string? Goal { get; set; }

    [MaxLength(3)]
    public string? Difficulty { get; set; }

    public int? Weeks { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!RoutineConstants.Goal.IsValid(Goal))
            yield return new ValidationResult(
                "Objetivo inválido. Use: HYP, WLS, DEF, CON, STR ou END",
                new[] { nameof(Goal) });

        if (!RoutineConstants.Difficulty.IsValid(Difficulty))
            yield return new ValidationResult(
                "Dificuldade inválida. Use: BEG, INT ou ADV",
                new[] { nameof(Difficulty) });

        if (Weeks.HasValue && (Weeks.Value < 1 || Weeks.Value > 52))
            yield return new ValidationResult(
                "Semanas deve estar entre 1 e 52",
                new[] { nameof(Weeks) });
    }
}

public class UpdateRoutineRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(3)]
    public string? Goal { get; set; }

    [MaxLength(3)]
    public string? Difficulty { get; set; }

    public int? Weeks { get; set; }

    public string? Status { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!RoutineConstants.Goal.IsValid(Goal))
            yield return new ValidationResult(
                "Objetivo inv�lido. Use: HYP, WLS, DEF, CON, STR ou END",
                new[] { nameof(Goal) });

        if (!RoutineConstants.Difficulty.IsValid(Difficulty))
            yield return new ValidationResult(
                "Dificuldade inválida. Use: BEG, INT ou ADV",
                new[] { nameof(Difficulty) });

        if (Weeks.HasValue && (Weeks.Value < 1 || Weeks.Value > 52))
            yield return new ValidationResult(
                "Semanas deve estar entre 1 e 52",
                new[] { nameof(Weeks) });
    }
}

public class AssignRoutineToCustomerRequest
{
    [Required(ErrorMessage = "ID da rotina é obrigatório")]
    public Guid RoutineId { get; set; }

    [Required(ErrorMessage = "ID do cliente é obrigatório")]
    public Guid CustomerId { get; set; }

    public DateTime? ExpiresAt { get; set; }
}
