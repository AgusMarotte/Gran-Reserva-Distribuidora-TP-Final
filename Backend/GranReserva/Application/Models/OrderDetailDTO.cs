using Domain.Entities;

namespace Application.Models
{
    public class OrderDetailDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Amount { get; set; }
        public int UnitaryPrice { get; set; }

        public static OrderDetailDTO? Create(OrderDetail orderDetail)
        {
            if (orderDetail == null) return null;

            return new OrderDetailDTO
            {
                ProductId = orderDetail.ProductId,
                ProductName = orderDetail.Product?.Name ?? "Producto no encontrado",
                Amount = orderDetail.Amount,
                UnitaryPrice = orderDetail.UnitaryPrice
            };
        }
    }
}