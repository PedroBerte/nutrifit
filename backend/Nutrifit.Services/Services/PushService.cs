using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using System.Diagnostics;
using System.Net;
using System.Text.Json;
using WebPush;

namespace Nutrifit.Services.Services
{
    public class PushService : IPushService
    {
        private readonly NutrifitContext _context;
        private readonly VapidDetails _vapid;
        private readonly WebPushClient _client;
        private readonly ILogger<PushService> _logger;
        
        public PushService(NutrifitContext context, IConfiguration cfg, ILogger<PushService> logger)
        {
            _context = context;
            _client = new WebPushClient();
            _vapid = new VapidDetails(
                cfg["Vapid:Subject"],
                cfg["Vapid:PublicKey"],
                cfg["Vapid:PrivateKey"]
            );
            _logger = logger;
        }

        public async Task Subscribe(PushSubscriptionDto dto, Guid userId, string userAgent)
        {
            var stopwatch = Stopwatch.StartNew();
            
            try
            {
                var existing = await _context.PushSubscriptions
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == dto.endpoint);

                if (existing == null)
                {
                    _logger.LogInformation("Criando nova subscription para usuário {UserId} com UserAgent: {UserAgent}",
                        userId, userAgent);
                    
                    _context.PushSubscriptions.Add(new PushSubscriptionEntity
                    {
                        UserId = userId,
                        Endpoint = dto.endpoint,
                        P256dh = dto.keys.p256dh,
                        Auth = dto.keys.auth,
                        ExpirationTime = dto.expirationTime,
                        UserAgent = userAgent,
                        IsActive = true
                    });
                }
                else
                {
                    _logger.LogInformation("Atualizando subscription existente {SubscriptionId} para usuário {UserId}. " +
                        "Status anterior: {PreviousStatus}, Expiration anterior: {PreviousExpiration}",
                        existing.Id, userId, existing.IsActive, existing.ExpirationTime);
                    
                    existing.P256dh = dto.keys.p256dh;
                    existing.Auth = dto.keys.auth;
                    existing.ExpirationTime = dto.expirationTime;
                    existing.IsActive = true;
                }
                
                var changes = await _context.SaveChangesAsync();
                stopwatch.Stop();
                
                _logger.LogInformation("Subscribe concluído com sucesso para usuário {UserId}. " +
                    "Alterações salvas: {ChangesCount}, Tempo: {ElapsedMs}ms",
                    userId, changes, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception e)
            {
                stopwatch.Stop();
                _logger.LogError(e, "Erro ao realizar o subscribe das push notifications para usuário {UserId}. " +
                    "Endpoint: {Endpoint}, UserAgent: {UserAgent}, Tempo até erro: {ElapsedMs}ms",
                    userId, dto.endpoint, userAgent, stopwatch.ElapsedMilliseconds);
                throw;
            }
        }

        public async Task Unsubscribe(string endpoint, Guid userId)
        {
            try
            {
                var sub = await _context.PushSubscriptions
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == endpoint);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao buscar subscription para unsubscribe do usuário {UserId} com endpoint {Endpoint}. ",
                    userId, endpoint);
                throw;
            }
        }

        public async Task SendToUserAsync(Guid userId, object payload)
        {
            var totalStopwatch = Stopwatch.StartNew();
            
            _logger.LogInformation("Iniciando envio de push notification para usuário {UserId}", userId);
            
            try
            {
                var subs = await _context.PushSubscriptions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .ToListAsync();

                if (!subs.Any())
                {
                    _logger.LogWarning("Nenhuma subscription ativa encontrada para usuário {UserId}", userId);
                    return;
                }

                var json = JsonSerializer.Serialize(payload);
                var payloadSize = System.Text.Encoding.UTF8.GetByteCount(json);
                
                _logger.LogInformation("Enviando push para {SubscriptionCount} subscriptions ativas (usuário {UserId}). " +
                    "Payload size: {PayloadSize} bytes",
                    subs.Count, userId, payloadSize);

                var successCount = 0;
                var failureCount = 0;
                var deactivatedCount = 0;

                foreach (var s in subs)
                {
                    var pushStopwatch = Stopwatch.StartNew();
                    var pushSub = new PushSubscription(s.Endpoint, s.P256dh, s.Auth);
                    
                    try
                    {
                        await _client.SendNotificationAsync(pushSub, json, _vapid);
                        pushStopwatch.Stop();
                        
                        successCount++;
                        _logger.LogDebug("Push enviado com sucesso para subscription {SubscriptionId} " +
                            "(endpoint: {EndpointPrefix}...) em {ElapsedMs}ms",
                            s.Id, s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)), 
                            pushStopwatch.ElapsedMilliseconds);
                    }
                    catch (WebPushException ex) when (ex.StatusCode == HttpStatusCode.Gone || ex.StatusCode == HttpStatusCode.NotFound)
                    {
                        pushStopwatch.Stop();
                        deactivatedCount++;
                        
                        _logger.LogWarning("Subscription {SubscriptionId} inválida/expirada (desativando). " +
                            "Status: {StatusCode}, UserAgent: {UserAgent}, Endpoint: {EndpointPrefix}..., Tempo: {ElapsedMs}ms",
                            s.Id, ex.StatusCode, s.UserAgent, 
                            s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)), 
                            pushStopwatch.ElapsedMilliseconds);
                        
                        s.IsActive = false;
                    }
                    catch (WebPushException ex)
                    {
                        pushStopwatch.Stop();
                        failureCount++;
                        
                        _logger.LogError(ex, "Falha WebPush para subscription {SubscriptionId}. " +
                            "Status: {StatusCode}, Endpoint: {EndpointPrefix}..., UserAgent: {UserAgent}, " +
                            "Message: {ErrorMessage}, Tempo: {ElapsedMs}ms",
                            s.Id, ex.StatusCode, s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)), 
                            s.UserAgent, ex.Message, pushStopwatch.ElapsedMilliseconds);
                    }
                    catch (Exception ex)
                    {
                        pushStopwatch.Stop();
                        failureCount++;
                        
                        _logger.LogError(ex, "Falha desconhecida ao enviar push para subscription {SubscriptionId} " +
                            "(endpoint: {EndpointPrefix}...). UserAgent: {UserAgent}, Tempo: {ElapsedMs}ms",
                            s.Id, s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)), 
                            s.UserAgent, pushStopwatch.ElapsedMilliseconds);
                    }
                }
                
                totalStopwatch.Stop();
                
                _logger.LogInformation("Envio de push notifications concluído para usuário {UserId}. " +
                    "Sucessos: {SuccessCount}, Falhas: {FailureCount}, Desativadas: {DeactivatedCount}, " +
                    "Total de subscriptions: {TotalCount}, Tempo total: {TotalElapsedMs}ms, " +
                    "Payload size: {PayloadSize} bytes",
                    userId, successCount, failureCount, deactivatedCount, subs.Count, 
                    totalStopwatch.ElapsedMilliseconds, payloadSize);
            }
            catch (Exception e)
            {
                totalStopwatch.Stop();
                _logger.LogError(e, "Erro crítico ao enviar push notifications para usuário {UserId}. " +
                    "Tempo até erro: {ElapsedMs}ms", userId, totalStopwatch.ElapsedMilliseconds);
                throw;
            }
        }
    }
}