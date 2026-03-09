namespace Nutrifit.Services.DTO;

public class ExerciseDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public bool IsPublished { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ExerciseCategoryDto? Category { get; set; }
    public List<MuscleDto>? PrimaryMuscles { get; set; }
    public List<MuscleDto>? SecondaryMuscles { get; set; }
}

public class CreateExerciseRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public bool IsPublished { get; set; } = false;
    public string ExerciseType { get; set; } = "Standard";
    public List<Guid> PrimaryMuscleIds { get; set; } = new();
    public List<Guid> SecondaryMuscleIds { get; set; } = new();
}

public class UpdateExerciseRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public bool IsPublished { get; set; }
    public string ExerciseType { get; set; } = "Standard";
    public List<Guid> PrimaryMuscleIds { get; set; } = new();
    public List<Guid> SecondaryMuscleIds { get; set; } = new();
}

public class UpdateExerciseMediaRequest
{
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? ExerciseType { get; set; }
}

public class ExerciseStepDto
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
}

public class CreateExerciseStepRequest
{
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
}

public class UpdateExerciseStepRequest
{
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
}

public class ReplaceExerciseStepsRequest
{
    public List<CreateExerciseStepRequest> Steps { get; set; } = new();
}

public class ExerciseCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "A";
}

public class MuscleGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "A";
}

public class MuscleDto
{
    public Guid Id { get; set; }
    public Guid MuscleGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "A";

    // Navigation property
    public MuscleGroupDto? MuscleGroup { get; set; }
}
