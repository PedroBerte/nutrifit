using System.ComponentModel.DataAnnotations;

namespace Nutrifit.Services.ViewModel.Request;

public class CreateRoutineRequest
{
    [Required(ErrorMessage = "Título é obrigatório")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Goal { get; set; }
    
    public int? Weeks { get; set; }
    
    [MaxLength(50)]
    public string? Difficulty { get; set; }
}

public class UpdateRoutineRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }
    
    [MaxLength(500)]
    public string? Goal { get; set; }
    
    public int? Weeks { get; set; }
    
    [MaxLength(50)]
    public string? Difficulty { get; set; }
    
    public string? Status { get; set; }
}

public class AssignRoutineToCustomerRequest
{
    [Required(ErrorMessage = "ID da rotina é obrigatório")]
    public Guid RoutineId { get; set; }
    
    [Required(ErrorMessage = "ID do cliente é obrigatório")]
    public Guid CustomerId { get; set; }
}
