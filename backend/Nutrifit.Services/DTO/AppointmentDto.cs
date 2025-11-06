using Nutrifit.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.DTO
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }
        public Guid CustomerProfessionalBondId { get; set; }

        public DateTime ScheduledAt { get; set; }
        public string Type { get; set; } = "PR"; // PR = Presencial, ON = Online
        public Guid? AddressId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "P"; // P = Pendente, A = Aceito, R = Rejeitado, C = Cancelado
        public AddressDto? Address { get; set; }
    }
}
