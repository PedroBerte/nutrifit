using Nutrifit.Services.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services.Interfaces
{
    public interface IMailService
    {
        Task SendAsync(MailMessageDTO msg, CancellationToken ct = default);
    }
}
