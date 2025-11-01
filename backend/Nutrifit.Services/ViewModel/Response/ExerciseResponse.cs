namespace Nutrifit.Services.ViewModel.Response;

public class ExerciseResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Instruction { get; set; }
    public string? ImageUrl { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public bool IsPublished { get; set; }
    public bool IsCustom { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public List<string> PrimaryMuscles { get; set; } = new();
    public List<string> SecondaryMuscles { get; set; } = new();
}

public class ExerciseCategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class MuscleGroupResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<MuscleResponse>? Muscles { get; set; }
}

public class MuscleResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MuscleGroupName { get; set; } = string.Empty;
}
