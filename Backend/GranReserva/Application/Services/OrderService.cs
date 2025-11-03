using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Domain.Entities;
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

        public async Task<OrderDTO> GetOrderByIdAsync(int id, bool includesoftdeleted = false)
        {
            var order = includesoftdeleted
                ? await _orderRepository.GetByIdAsync(id)
                : await _orderRepository.GetActiveByIdAsync(id);
            
            return OrderDTO.Create(order);
        }

        public async Task<List<OrderDTO>> GetAllOrdersAsync(bool includesoftdeleted = false)
        {
            var orders = includesoftdeleted
                ? await _orderRepository.GetAllAsync()
                : await _orderRepository.GetActiveAllAsync();
            
            return OrderDTO.CreateList(orders);
        }

        public async Task<List<OrderDTO>> GetOrdersByClientIdAsync(int clientId)
        {
            var orders = await _orderRepository.GetActiveOrdersByClientIdAsync(clientId);
            return OrderDTO.CreateList(orders);
        }

        public async Task<OrderDTO> CreateOrderAsync(CreationOrderDTO orderdto)
        {
            var client = await _clientRepository.GetByIdAsync(orderdto.ClientId);
            if (client == null || client.IsDeleted)
            {
                throw new ValidationException("El cliente no existe o no está activo.");
            }

            var newOrder = new Order
            {
                ClientId = orderdto.ClientId,
                Date = DateTime.UtcNow,
                State = Domain.Enums.OrderStatus.Pending
            };

            int total = 0;

            foreach (var item in orderdto.Items)
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

                var orderDetail = new OrderDetail
                {
                    Order = newOrder,
                    ProductId = product.Id,
                    Amount = item.Amount,
                    UnitaryPrice = product.Price
                };

                newOrder.OrderDetails.Add(orderDetail);
                total += (product.Price * item.Amount);
            }

            newOrder.Total = total;
            
            client.Points += (total / 100);
            await _clientRepository.UpdateAsync(client);

            var createdOrder = await _orderRepository.AddAsync(newOrder);
            
            var fullOrder = await _orderRepository.GetActiveByIdAsync(createdOrder.Id);
            return OrderDTO.Create(fullOrder);
        }

        public async Task<bool> UpdateOrderStateAsync(int id, UpdateOrderStateDTO orderdto)
        {
            var order = await _orderRepository.GetActiveByIdAsync(id);
            if (order == null)
            {
                return false;
            }
            
            order.State = orderdto.NewState;
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

        public async Task<OrderDTO> RestoreOrderAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null || order.IsDeleted == false)
            {
                return null;
            }
            
            await _orderRepository.RestoreAsync(order);
            return OrderDTO.Create(order);
        }
    }
}