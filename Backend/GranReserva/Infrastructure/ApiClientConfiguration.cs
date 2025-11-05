namespace Infrastructure
{
    public class ApiClientConfiguration
    {
        public int RetryCount { get; set; }
        public int RetryAttemptInSeconds { get; set; }
        public int HandledEventsAllowedBeforeBreaking { get; set; }
        public int DurationOfBreakInSeconds { get; set; }
    }
}