using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.ViewModel.Request
{
    public record NotificationRequest(string Title, string Body, string? Url, object? Actions);
}
