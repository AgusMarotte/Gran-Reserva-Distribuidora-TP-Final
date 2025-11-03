using Domain.Entities;
using Domain.Enums;

namespace Application.Models
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int Total { get; set; }
        public OrderStatus State { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public List<OrderDetailDTO> OrderDetails { get; set; }

        public static OrderDTO Create(Order order)
        {
            if (order == null) return null;

            return new OrderDTO
            {
                Id = order.Id,
                Date = order.Date,
                Total = order.Total,
                State = order.State,
                ClientId = order.ClientId,
                ClientName = order.Client != null ? $"{order.Client.Name} {order.Client.LastName}" : "Cliente no encontrado",
                OrderDetails = order.OrderDetails?.Select(OrderDetailDTO.Create).ToList() ?? new List<OrderDetailDTO>()
            };
        }

        public static List<OrderDTO> CreateList(List<Order> orderList)
        {
            return orderList.Select(Create).ToList();
        }
    }
}