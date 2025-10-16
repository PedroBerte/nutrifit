using System.ComponentModel.DataAnnotations;

namespace Nutrifit.Services.ViewModel.Request;

public class CreateWorkoutRequest
{
    [Required(ErrorMessage = "Título é obrigatório")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public int? ExpectedDuration { get; set; }
}

public class UpdateWorkoutRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public int? ExpectedDuration { get; set; }
    
    public string? Status { get; set; }
    
    public int? TotalVolume { get; set; }
}

public class CompleteWorkoutRequest
{
    public int? TotalVolume { get; set; }
}

public class CreateWorkoutFeedbackRequest
{
    [Range(1, 5, ErrorMessage = "Avaliação deve ser entre 1 e 5")]
    public int? Value { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
}

public class CreateWorkoutSetRequest
{
    [Required(ErrorMessage = "ID do exercício é obrigatório")]
    public Guid ExerciseId { get; set; }
    
    [Required(ErrorMessage = "Número máximo de séries é obrigatório")]
    [Range(1, 20, ErrorMessage = "MaxSets deve ser entre 1 e 20")]
    public int MaxSets { get; set; }
    
    [Required(ErrorMessage = "Ordem é obrigatória")]
    public int Order { get; set; }
    
    [MaxLength(200)]
    public string? Field { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public int? ExpectedSets { get; set; }
}

public class UpdateWorkoutSetRequest
{
    public int? MaxSets { get; set; }
    
    public int? Order { get; set; }
    
    [MaxLength(200)]
    public string? Field { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public int? ExpectedSets { get; set; }
}

public class CreateWorkoutExerciseRequest
{
    public decimal? Load { get; set; }
    
    public int? ExpectedRepetitions { get; set; }
}

public class UpdateWorkoutExerciseRequest
{
    public decimal? Load { get; set; }
    
    public int? ExpectedRepetitions { get; set; }
}
