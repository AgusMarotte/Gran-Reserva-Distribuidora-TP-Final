using Application.Models;
using Application.Models.Request.RewardDTO;

namespace Application.Interfaces
{
    public interface IRewardService
    {
        Task<RewardDTO> GetRewardByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<RewardDTO>> GetAllRewardsAsync(bool includesoftdeleted = false);
        Task<RewardDTO> CreateRewardAsync(CreationRewardDTO rewarddto);
        Task<bool> UpdateRewardAsync(int id, UpdateRewardDTO rewarddto);
        Task<RewardDTO> PartialUpdateRewardAsync(int id, RewardStockAndPointsDTO rewarddto);
        Task<bool> DeleteRewardAsync(int id, bool permanently = false);
        Task<RewardDTO> RestoreRewardAsync(int id);
    }
}