using Application.Interfaces;
using Application.Models.Request.RewardDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RewardController : ControllerBase
    {
        private readonly IRewardService _rewardService;

        public RewardController(IRewardService rewardService)
        {
            _rewardService = rewardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRewards([FromQuery] bool includesoftdeleted = false)
        {
            var rewards = await _rewardService.GetAllRewardsAsync(includesoftdeleted);
            return Ok(rewards);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRewardById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var reward = await _rewardService.GetRewardByIdAsync(id, includesoftdeleted);
            if (reward == null)
            {
                return NotFound();
            }
            return Ok(reward);
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetRewardsByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("El término de búsqueda no puede estar vacío.");
            }
            var rewards = await _rewardService.GetRewardsByNameAsync(name);
            return Ok(rewards);
        }

        [HttpPost]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> CreateReward([FromBody] CreationRewardDTO rewarddto)
        {
            if (rewarddto == null)
            {
                return BadRequest();
            }
            var newReward = await _rewardService.CreateRewardAsync(rewarddto);
            return CreatedAtAction(nameof(GetRewardById), new { id = newReward.Id }, newReward);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> UpdateReward(int id, [FromBody] UpdateRewardDTO rewarddto)
        {
            if (rewarddto == null)
            {
                return BadRequest("Datos de recompensa inválidos.");
            }
            var result = await _rewardService.UpdateRewardAsync(id, rewarddto);
            if (!result)
            {
                return NotFound("Recompensa no encontrada.");
            }
            return NoContent();
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> PartialUpdateReward(int id, [FromBody] RewardStockAndPointsDTO rewardstockandpointsdto)
        {
            if (rewardstockandpointsdto == null)
            {
                return BadRequest("Datos inválidos.");
            }

            var updatedReward = await _rewardService.PartialUpdateRewardAsync(id, rewardstockandpointsdto);

            if (updatedReward == null)
            {
                return NotFound("Recompensa no encontrada.");
            }

            return Ok(updatedReward);
        }

        [HttpPatch("{id}/restore")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> RestoreReward(int id)
        {
            var reward = await _rewardService.RestoreRewardAsync(id);
            if (reward == null)
            {
                return NotFound("No se pudo restaurar la recompensa. Es posible que no exista o que ya esté activa.");
            }
            return Ok(reward);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> DeleteReward(int id, [FromQuery] bool permanently = false)
        {
            var result = await _rewardService.DeleteRewardAsync(id, permanently);
            if (!result)
            {
                return NotFound("Recompensa no encontrada.");
            }
            return NoContent();
        }
    }
}