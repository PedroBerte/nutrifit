namespace Nutrifit.Services.DTO;

public class ExerciseDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Instruction { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ExerciseCategoryDto? Category { get; set; }
    public List<MuscleDto>? PrimaryMuscles { get; set; }
    public List<MuscleDto>? SecondaryMuscles { get; set; }
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
