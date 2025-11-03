using Domain.Enums;

namespace Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int Total { get; set; }
        public OrderStatus State { get; set; } = OrderStatus.Pending;

        public int ClientId { get; set; }
        public Client Client { get; set; }

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        
        public bool IsDeleted { get; set; } = false;
    }
}