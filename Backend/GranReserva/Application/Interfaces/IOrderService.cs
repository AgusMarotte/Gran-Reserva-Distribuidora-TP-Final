using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces
{
    public interface IOrderService
    {
        Task<Order> GetOrderByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<Order>> GetAllOrdersAsync(bool includesoftdeleted = false);
        Task<List<Order>> GetOrdersByClientIdAsync(int clientId);
        Task<Order> CreateOrderAsync(Order order);
        Task<bool> UpdateOrderStateAsync(int id, OrderStatus newState);
        Task<bool> DeleteOrderAsync(int id, bool permanently = false);
        Task<Order> RestoreOrderAsync(int id);
    }
}