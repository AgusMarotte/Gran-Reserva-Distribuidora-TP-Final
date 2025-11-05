namespace Domain.Entities
{
    public class Client : User
    {
        public long Points { get; set; } = 0;
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<RewardExchange> RewardExchanges { get; set; } = new List<RewardExchange>();
    }
}