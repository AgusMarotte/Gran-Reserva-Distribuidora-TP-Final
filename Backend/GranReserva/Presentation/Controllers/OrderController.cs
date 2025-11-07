using Application.Interfaces;
using Application.Models.Request.OrderDTO;
using Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] bool includesoftdeleted = false)
        {
            var orders = await _orderService.GetAllOrdersAsync(includesoftdeleted);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetOrderById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var order = await _orderService.GetOrderByIdAsync(id, includesoftdeleted);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet("qr/{qrCode}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetOrderByQr([FromRoute] Guid qrCode)
        {
            var order = await _orderService.GetByQRCodeAsync(qrCode);
            if (order == null) return NotFound("No se ha encontrado una Orden con ese código QR.");
            return Ok(order);
        }

        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetOrdersByClientId(int clientId)
        {
            var orders = await _orderService.GetOrdersByClientIdAsync(clientId);
            return Ok(orders);
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int clientId))
            {
                throw new InvalidCredentialsException("No se pudo identificar al cliente desde el token.");
            }

            var orders = await _orderService.GetOrdersByClientIdAsync(clientId);
            return Ok(orders);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] CreationOrderDTO orderdto)
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int clientId))
            {
                throw new InvalidCredentialsException("No se pudo identificar al cliente desde el token.");
            }

            var newOrder = await _orderService.CreateOrderAsync(orderdto, clientId);
            return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.Id }, newOrder);
        }

        [HttpPut("{id}/state")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> UpdateOrderState(int id, [FromBody] UpdateOrderStateDTO orderdto)
        {
            var result = await _orderService.UpdateOrderStateAsync(id, orderdto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/restore")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> RestoreOrder(int id)
        {
            var order = await _orderService.RestoreOrderAsync(id);
            if (order == null)
            {
                return NotFound("No se pudo restaurar la orden. Es posible que no exista o que ya esté activa.");
            }
            return Ok(order);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> DeleteOrder(int id, [FromQuery] bool permanently = false)
        {
            var result = await _orderService.DeleteOrderAsync(id, permanently);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}