using Polly;
using Polly.Extensions.Http;

namespace Infrastructure
{
    public static class PollyResiliencePolicies
    {
        public static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(ApiClientConfiguration config)
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.BadRequest)
                .WaitAndRetryAsync(
                    config.RetryCount,
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt) * config.RetryAttemptInSeconds),
                    onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"[Polly Retry] Intento #{retryAttempt} en {timespan.TotalSeconds}s. Motivo: {GetFailureReason(outcome)}");
                        Console.ResetColor();
                    }
                );
        }

        public static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy(ApiClientConfiguration config)
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.BadRequest)
                .CircuitBreakerAsync(config.HandledEventsAllowedBeforeBreaking, TimeSpan.FromSeconds(config.DurationOfBreakInSeconds),
                onBreak: (outcome, breakDelay) =>
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"[Polly Circuit Breaker] Circuito ABIERTO por {breakDelay.TotalSeconds}s. Motivo: {GetFailureReason(outcome)}");
                    Console.ResetColor();
                },
                onReset: () =>
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("[Polly Circuit Breaker] Circuito CERRADO. Operación normal reanudada.");
                    Console.ResetColor();
                },
                onHalfOpen: () =>
                {
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine("[Polly Circuit Breaker] Circuito en estado SEMI-ABIERTO. Probando conexión...");
                    Console.ResetColor();
                });
        }

        private static string GetFailureReason(DelegateResult<HttpResponseMessage> outcome)
        {
            if (outcome.Exception != null)
                return outcome.Exception.Message;

            if (outcome.Result != null)
                return $"HTTP {(int)outcome.Result.StatusCode} ({outcome.Result.StatusCode})";

            return "Error desconocido";
        }
    }
}