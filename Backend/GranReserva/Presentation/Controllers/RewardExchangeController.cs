using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetAllExchanges([FromQuery] bool includesoftdeleted = false)
        {
            var exchanges = await _exchangeService.GetAllExchangesAsync(includesoftdeleted);
            return Ok(exchanges);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExchangeById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var exchange = await _exchangeService.GetExchangeByIdAsync(id, includesoftdeleted);
            if (exchange == null) return NotFound();
            return Ok(exchange);
        }

        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetExchangesByClientId(int clientId)
        {
            var exchanges = await _exchangeService.GetExchangesByClientIdAsync(clientId);
            return Ok(exchanges);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExchange([FromBody] CreationRewardExchangeDTO exchangedto)
        {
            var newExchange = await _exchangeService.CreateExchangeAsync(exchangedto);
            return CreatedAtAction(nameof(GetExchangeById), new { id = newExchange.Id }, newExchange);
        }

        [HttpPatch("{id}/restore")]
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
        public async Task<IActionResult> DeleteExchange(int id, [FromQuery] bool permanently = false)
        {
            var result = await _exchangeService.DeleteExchangeAsync(id, permanently);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}