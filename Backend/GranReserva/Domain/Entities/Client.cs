namespace Domain.Entities
{
    public class Client : User
    {
        public int Points { get; set; } = 0;
        public ICollection<Order> Orders { get; set; }
    }
}