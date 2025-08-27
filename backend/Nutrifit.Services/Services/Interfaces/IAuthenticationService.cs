using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task SendAccessEmailAsync(string email, string baseAppUrl, string ip, string ua);
        Task<string> ValidateSession(string token);
    }
}
