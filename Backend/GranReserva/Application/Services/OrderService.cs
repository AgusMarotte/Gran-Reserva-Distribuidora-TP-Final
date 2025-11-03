using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Interfaces;

namespace Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IClientRepository _clientRepository;

        public OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IClientRepository clientRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _clientRepository = clientRepository;
        }

        public async Task<Order> GetOrderByIdAsync(int id, bool includesoftdeleted = false)
        {
            var order = includesoftdeleted
                ? await _orderRepository.GetByIdAsync(id)
                : await _orderRepository.GetActiveByIdAsync(id);
            return order;
        }

        public async Task<List<Order>> GetAllOrdersAsync(bool includesoftdeleted = false)
        {
            var orders = includesoftdeleted
                ? await _orderRepository.GetAllAsync()
                : await _orderRepository.GetActiveAllAsync();
            return orders;
        }

        public async Task<List<Order>> GetOrdersByClientIdAsync(int clientId)
        {
            return await _orderRepository.GetActiveOrdersByClientIdAsync(clientId);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            var client = await _clientRepository.GetByIdAsync(order.ClientId);
            if (client == null || client.IsDeleted)
            {
                throw new ValidationException("El cliente no existe o no está activo.");
            }

            int total = 0;
            foreach (var item in order.OrderDetails)
            {
                var product = await _productRepository.GetActiveByIdAsync(item.ProductId);
                if (product == null)
                {
                    throw new NotFoundException($"El producto con ID {item.ProductId} no existe.");
                }
                if (product.Stock < item.Amount)
                {
                    throw new ValidationException($"No hay stock suficiente para '{product.Name}'. Stock disponible: {product.Stock}");
                }

                product.Stock -= item.Amount;
                await _productRepository.UpdateAsync(product);

                item.UnitaryPrice = product.Price;
                total += (product.Price * item.Amount);
            }

            order.Total = total;
            order.State = OrderStatus.Pending;
            order.Date = DateTime.UtcNow;
            
            client.Points += (total / 100);
            await _clientRepository.UpdateAsync(client);

            return await _orderRepository.AddAsync(order);
        }

        public async Task<bool> UpdateOrderStateAsync(int id, OrderStatus newState)
        {
            var order = await _orderRepository.GetActiveByIdAsync(id);
            if (order == null)
            {
                return false;
            }
            order.State = newState;
            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id, bool permanently = false)
        {
            if (permanently)
            {
                var order = await _orderRepository.GetByIdAsync(id);
                if (order == null) return false;
                await _orderRepository.DeletePermanentlyAsync(order);
                return true;
            }
            else
            {
                var order = await _orderRepository.GetActiveByIdAsync(id);
                if (order == null) return false;
                await _orderRepository.DeleteSoftAsync(order);
                return true;
            }
        }

        public async Task<Order> RestoreOrderAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null || order.IsDeleted == false)
            {
                return null;
            }
            await _orderRepository.RestoreAsync(order);
            return order;
        }
    }
}