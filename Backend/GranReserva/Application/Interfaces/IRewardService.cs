using Domain.Entities;

namespace Application.Interfaces
{
    public interface IRewardService
    
    {
        Task<Reward> GetRewardByIdAsync(int id);
        Task<List<Reward>> GetAllRewardsAsync();
    }
}