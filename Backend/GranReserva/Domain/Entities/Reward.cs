namespace Domain.Entities
{
    public class Reward
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int PointsRequired { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;
        public ICollection<RewardExchange> RewardExchanges { get; set; } = new List<RewardExchange>();
    }
}