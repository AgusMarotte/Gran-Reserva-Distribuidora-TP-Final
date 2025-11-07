using Application.Interfaces;
using Application.Models.Request.RewardExchangeDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RewardExchangeController : ControllerBase
    {
        private readonly IRewardExchangeService _exchangeService;

        public RewardExchangeController(IRewardExchangeService exchangeService)
        {
            _exchangeService = exchangeService;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllExchanges([FromQuery] bool includesoftdeleted = false)
        {
            var exchanges = await _exchangeService.GetAllExchangesAsync(includesoftdeleted);
            return Ok(exchanges);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetExchangeById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var exchange = await _exchangeService.GetExchangeByIdAsync(id, includesoftdeleted);
            if (exchange == null) return NotFound();
            return Ok(exchange);
        }

        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetExchangesByClientId(int clientId)
        {
            var exchanges = await _exchangeService.GetExchangesByClientIdAsync(clientId);
            return Ok(exchanges);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateExchange([FromBody] CreationRewardExchangeDTO exchangedto)
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int clientId))
            {
                return Unauthorized("No se pudo identificar al cliente desde el token.");
            }

            var newExchange = await _exchangeService.CreateExchangeAsync(exchangedto, clientId);
            return CreatedAtAction(nameof(GetExchangeById), new { id = newExchange.Id }, newExchange);
        }

        [HttpPatch("{id}/restore")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> RestoreExchange(int id)
        {
            var exchange = await _exchangeService.RestoreExchangeAsync(id);
            if (exchange == null)
            {
                return NotFound("No se pudo restaurar el canje. Es posible que no exista o que ya esté activo.");
            }
            return Ok(exchange);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> DeleteExchange(int id, [FromQuery] bool permanently = false)
        {
            var result = await _exchangeService.DeleteExchangeAsync(id, permanently);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}