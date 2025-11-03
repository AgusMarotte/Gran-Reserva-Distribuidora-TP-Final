using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetAllOrders([FromQuery] bool includesoftdeleted = false)
        {
            var orders = await _orderService.GetAllOrdersAsync(includesoftdeleted);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var order = await _orderService.GetOrderByIdAsync(id, includesoftdeleted);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetOrdersByClientId(int clientId)
        {
            var orders = await _orderService.GetOrdersByClientIdAsync(clientId);
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreationOrderDTO orderdto)
        {
            var newOrder = await _orderService.CreateOrderAsync(orderdto);
            return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.Id }, newOrder);
        }

        [HttpPut("{id}/state")]
        public async Task<IActionResult> UpdateOrderState(int id, [FromBody] UpdateOrderStateDTO orderdto)
        {
            var result = await _orderService.UpdateOrderStateAsync(id, orderdto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/restore")]
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
        public async Task<IActionResult> DeleteOrder(int id, [FromQuery] bool permanently = false)
        {
            var result = await _orderService.DeleteOrderAsync(id, permanently);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}