using Application.Models;

namespace Application.Interfaces
{
    public interface IRewardService
    {
        Task<RewardDTO> GetRewardByIdAsync(int id);
        Task<List<RewardDTO>> GetAllRewardsAsync();
    }
}