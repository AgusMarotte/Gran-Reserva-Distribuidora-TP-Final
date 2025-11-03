using Application.Interfaces;
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
        public async Task<IActionResult> GetAllRewards()
        {
            var rewards = await _rewardService.GetAllRewardsAsync();
            return Ok(rewards);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRewardById(int id)
        {
            var reward = await _rewardService.GetRewardByIdAsync(id);
            if (reward == null)
            {
                return NotFound();
            }
            return Ok(reward);
        }
<<<<<<< Updated upstream
=======

        [HttpPost]
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

        [HttpPatch("{id}/restore")]
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
        public async Task<IActionResult> DeleteReward(int id, [FromQuery] bool permanently = false)
        {
            var result = await _rewardService.DeleteRewardAsync(id, permanently);
            if (!result)
            {
                return NotFound("Recompensa no encontrada.");
            }
            return NoContent();
        }
>>>>>>> Stashed changes
    }
}