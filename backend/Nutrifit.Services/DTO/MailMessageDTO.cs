using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.DTO
{
    public record MailMessageDTO(
        string To,
        string Subject,
        string HtmlBody,
        string? TextBody = null,
        IEnumerable<MailAttachment>? Attachments = null,
        IEnumerable<string>? Cc = null,
        IEnumerable<string>? Bcc = null
    );

    public record MailAttachment(string FileName, byte[] Content, string ContentType = "application/octet-stream");
}
