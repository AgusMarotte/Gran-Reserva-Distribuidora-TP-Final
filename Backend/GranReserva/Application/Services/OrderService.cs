using Application.Interfaces;
using Application.Models;
using Application.Models.Request.OrderDTO;
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
        private readonly IUserRepository _userRepository;
        private readonly IQRService _qrService;

        public OrderService(
            IOrderRepository orderRepository,
            IProductRepository productRepository,
            IClientRepository clientRepository,
            IUserRepository userRepository,
            IQRService qrService)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _qrService = qrService;
        }

        private string GenerateQrBase64(Guid uniqueCode)
        {
            var qrBytes = _qrService.GenerateQRCode(uniqueCode.ToString());
            return Convert.ToBase64String(qrBytes);
        }

        public async Task<OrderDTO> GetOrderByIdAsync(int id, bool includesoftdeleted = false)
        {
            var order = includesoftdeleted
                ? await _orderRepository.GetByIdAsync(id)
                : await _orderRepository.GetActiveByIdAsync(id);

            var dto = OrderDTO.Create(order);
            if (dto != null)
            {
                dto.QrCodeBase64 = GenerateQrBase64(order.QRCode);
            }
            return dto;
        }

        public async Task<OrderDTO> GetByQRCodeAsync(Guid qrCode)
        {
            var order = await _orderRepository.GetByQRCodeAsync(qrCode);
            if (order == null) return null;

            var dto = OrderDTO.Create(order);
            dto.QrCodeBase64 = GenerateQrBase64(order.QRCode);
            return dto;
        }

        public async Task<List<OrderDTO>> GetAllOrdersAsync(bool includesoftdeleted = false)
        {
            var orders = includesoftdeleted
                ? await _orderRepository.GetAllAsync()
                : await _orderRepository.GetActiveAllAsync();

            var dtos = OrderDTO.CreateList(orders);
            foreach (var dto in dtos)
            {
                var originalOrder = orders.First(o => o.Id == dto.Id);
                dto.QrCodeBase64 = GenerateQrBase64(originalOrder.QRCode);
            }

            return dtos;
        }

        public async Task<List<OrderDTO>> GetOrdersByClientIdAsync(int clientId)
        {
            var orders = await _orderRepository.GetActiveOrdersByClientIdAsync(clientId);
            var dtos = OrderDTO.CreateList(orders);
            foreach (var dto in dtos)
            {
                var originalOrder = orders.First(o => o.Id == dto.Id);
                dto.QrCodeBase64 = GenerateQrBase64(originalOrder.QRCode);
            }
            return dtos;
        }

        public async Task<OrderDTO> CreateOrderAsync(CreationOrderDTO orderdto, int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
            {
                var user = await _userRepository.GetActiveByIdAsync(clientId);
                if (user != null)
                {
                    throw new ValidationException($"El usuario con ID {clientId} es un '{user.Role}' y no puede crear órdenes.");
                }
                throw new NotFoundException($"No se encontró ningún cliente con ID {clientId}.");
            }

            if (client.IsDeleted)
            {
                throw new ValidationException("El cliente no está activo.");
            }

            var newOrder = new Order
            {
                ClientId = clientId,
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

            long pointsAwarded = (long)Math.Ceiling(total * 0.01);
            client.Points += pointsAwarded;
            await _clientRepository.UpdateAsync(client);

            var createdOrder = await _orderRepository.AddAsync(newOrder);

            var fullOrder = await _orderRepository.GetActiveByIdAsync(createdOrder.Id);
            var dto = OrderDTO.Create(fullOrder);
            if (dto != null)
            {
                dto.QrCodeBase64 = GenerateQrBase64(fullOrder.QRCode);
            }
            return dto;
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
            var dto = OrderDTO.Create(order);
            if (dto != null)
            {
                dto.QrCodeBase64 = GenerateQrBase64(order.QRCode);
            }
            return dto;
        }
    }
}