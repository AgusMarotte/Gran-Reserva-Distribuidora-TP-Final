using Application.Models;
using Application.Models.Request.OrderDTO;

namespace Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDTO> GetOrderByIdAsync(int id, bool includesoftdeleted = false);
        Task<OrderDTO> GetByQRCodeAsync(Guid qrCode);
        Task<List<OrderDTO>> GetAllOrdersAsync(bool includesoftdeleted = false);
        Task<List<OrderDTO>> GetOrdersByClientIdAsync(int clientId);
        Task<OrderDTO> CreateOrderAsync(CreationOrderDTO orderdto, int clientId);
        Task<bool> UpdateOrderStateAsync(int id, UpdateOrderStateDTO orderdto);
        Task<bool> DeleteOrderAsync(int id, bool permanently = false);
        Task<OrderDTO> RestoreOrderAsync(int id);
    }
}