using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IOrderRepository : IRepositoryBase<Order>
    {
        Task<Order> GetActiveByIdAsync(int id);
        Task<List<Order>> GetActiveAllAsync();
        Task<List<Order>> GetActiveOrdersByClientIdAsync(int clientId);
        Task DeleteSoftAsync(Order order);
        Task RestoreAsync(Order order);
    }
}