using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _cfg;

        public MailService(IConfiguration cfg)
        {
            _cfg = cfg;
        }

        public async Task SendAsync(MailMessageDTO msg, CancellationToken ct = default)
        {
            var s = _cfg.GetSection("Smtp");
            var host = s["Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(s["Port"], out var p) ? p : 587;
            var useStartTls = bool.TryParse(s["UseStartTls"], out var startTls) ? startTls : true;
            var user = s["User"]!;
            var pass = s["AppPassword"]!;
            var fromName = s["FromName"] ?? user;
            var fromAddress = s["FromAddress"] ?? user;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromAddress));
            message.To.Add(MailboxAddress.Parse(msg.To));
            if (msg.Cc != null)
                foreach (var cc in msg.Cc) message.Cc.Add(MailboxAddress.Parse(cc));
            if (msg.Bcc != null)
                foreach (var bcc in msg.Bcc) message.Bcc.Add(MailboxAddress.Parse(bcc));

            message.Subject = msg.Subject;

            var builder = new BodyBuilder
            {
                HtmlBody = msg.HtmlBody,
                TextBody = msg.TextBody
            };

            if (msg.Attachments != null)
            {
                foreach (var a in msg.Attachments)
                    builder.Attachments.Add(a.FileName, a.Content, MimeKit.ContentType.Parse(a.ContentType));
            }

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();

            await client.ConnectAsync(host, port,
                useStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.SslOnConnect, ct);

            await client.AuthenticateAsync(user, pass, ct);

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
    }
}
