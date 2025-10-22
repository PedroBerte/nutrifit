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

    public int? Weeks { get; set; }

    [MaxLength(3)]
    public string? Difficulty { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!RoutineConstants.Goal.IsValid(Goal))
            yield return new ValidationResult(
                "Objetivo inv�lido. Use: HYP, WLS, DEF, CON, STR ou END",
                new[] { nameof(Goal) });

        if (!RoutineConstants.Difficulty.IsValid(Difficulty))
            yield return new ValidationResult(
                "Dificuldade inv�lida. Use: BEG, INT ou ADV",
                new[] { nameof(Difficulty) });
    }
}

public class UpdateRoutineRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(3)]
    public string? Goal { get; set; }

    public int? Weeks { get; set; }

    [MaxLength(3)]
    public string? Difficulty { get; set; }

    public string? Status { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!RoutineConstants.Goal.IsValid(Goal))
            yield return new ValidationResult(
                "Objetivo inv�lido. Use: HYP, WLS, DEF, CON, STR ou END",
                new[] { nameof(Goal) });

        if (!RoutineConstants.Difficulty.IsValid(Difficulty))
            yield return new ValidationResult(
                "Dificuldade inv�lida. Use: BEG, INT ou ADV",
                new[] { nameof(Difficulty) });
    }
}

public class AssignRoutineToCustomerRequest
{
    [Required(ErrorMessage = "ID da rotina � obrigat�rio")]
    public Guid RoutineId { get; set; }

    [Required(ErrorMessage = "ID do cliente � obrigat�rio")]
    public Guid CustomerId { get; set; }
}
