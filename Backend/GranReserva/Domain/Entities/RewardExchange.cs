namespace Domain.Entities
{
    public class RewardExchange
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public long PointsUsed { get; set; }
        public int ClientId { get; set; }
        public Client? Client { get; set; }
        public int RewardId { get; set; }
        public Reward? Reward { get; set; }
        public bool IsDeleted { get; set; } = false;
        public Guid UniqueCode { get; set; } = Guid.NewGuid();
    }
}