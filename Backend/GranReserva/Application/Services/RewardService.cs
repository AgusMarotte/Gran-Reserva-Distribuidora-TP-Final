using Application.Interfaces;
using Application.Models;
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

        public async Task<RewardDTO> GetRewardByIdAsync(int id)
        {
            var reward = await _rewardRepository.GetByIdAsync(id);
            return RewardDTO.Create(reward);
        }

        public async Task<List<RewardDTO>> GetAllRewardsAsync()
        {
            var rewards = await _rewardRepository.GetAllAsync();
            return RewardDTO.CreateList(rewards);
        }
    }
}