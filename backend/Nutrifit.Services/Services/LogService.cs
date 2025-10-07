using Dapper;
using Npgsql;
using Nutrifit.Services.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services
{
    public class LogService : ILogService
    {
        private readonly NpgsqlDataSource _ds;
        public LogService(NpgsqlDataSource ds) => _ds = ds;

        public async Task<IReadOnlyList<LogEntry>> GetAsync(
            string? level, DateTimeOffset? since, string? text, int take)
        {
            take = (take > 0 && take <= 1000) ? take : 200;

            int? parsedLevel = TryParseLevel(level);

            var sb = new StringBuilder(@"
            select 
                message as Message,
                message_template as Message_Template,
                level as Level,
                timestamp as Timestamp,
                exception as Exception,
                log_event as Log_Event
            from app_logs
            where 1=1 ");

            var p = new DynamicParameters();

            if (parsedLevel.HasValue)
            {
                sb.Append(" and level = @level ");
                p.Add("level", parsedLevel.Value);
            }

            if (since.HasValue)
            {
                sb.Append(" and timestamp >= @since ");
                p.Add("since", since.Value.UtcDateTime);
            }

            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.Append(" and message ilike @text ");
                p.Add("text", $"%{text}%");
            }

            sb.Append(" order by timestamp desc limit @take;");
            p.Add("take", take);

            await using var conn = await _ds.OpenConnectionAsync();
            var rows = await conn.QueryAsync<LogEntry>(sb.ToString(), p);
            return rows.AsList();
        }

        private static int? TryParseLevel(string? level)
        {
            if (string.IsNullOrWhiteSpace(level)) return null;

            if (int.TryParse(level, out var n) && n >= 0 && n <= 5) return n;

            return level.Trim().ToLowerInvariant() switch
            {
                "verbose" or "v" => 0,
                "debug" or "d" => 1,
                "information" or "info" or "i" => 2,
                "warning" or "warn" or "w" => 3,
                "error" or "e" => 4,
                "fatal" or "f" => 5,
                _ => null
            };
        }
    }
}
