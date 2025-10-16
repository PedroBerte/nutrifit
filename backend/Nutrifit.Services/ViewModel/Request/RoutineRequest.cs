using System.ComponentModel.DataAnnotations;

namespace Nutrifit.Services.ViewModel.Request;

public class CreateRoutineRequest
{
    [Required(ErrorMessage = "T�tulo � obrigat�rio")]
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
    [Required(ErrorMessage = "ID da rotina � obrigat�rio")]
    public Guid RoutineId { get; set; }
    
    [Required(ErrorMessage = "ID do cliente � obrigat�rio")]
    public Guid CustomerId { get; set; }
}
