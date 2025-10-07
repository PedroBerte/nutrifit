using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services.Interfaces
{
    public class LogEntry
    {
        public string Message { get; set; } = default!;
        public string? Message_Template { get; set; }
        public int Level { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Exception { get; set; }
        public string? Log_Event { get; set; }
    }


    public interface ILogService
    {
        Task<IReadOnlyList<LogEntry>> GetAsync(
            string? level = null,
            DateTimeOffset? since = null,
            string? text = null,
            int take = 200);
    }

}
