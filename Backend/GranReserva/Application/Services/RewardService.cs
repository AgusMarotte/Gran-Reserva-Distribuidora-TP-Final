using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class RewardService : IRewardService
    {
        private readonly IRewardRepository _rewardRepository;

        public RewardService(IRewardRepository rewardRepository)
        {
            _rewardRepository = rewardRepository;
        }

        public async Task<Reward> GetRewardByIdAsync(int id)
        {
            return await _rewardRepository.GetByIdAsync(id);
        }

        public async Task<List<Reward>> GetAllRewardsAsync()
        {
            return await _rewardRepository.GetAllAsync();
        }
    }
}