using Application.Interfaces;
using Application.Models;
using Application.Models.Request.RewardDTO;
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

        public async Task<RewardDTO> GetRewardByIdAsync(int id, bool includesoftdeleted = false)
        {
            var reward = includesoftdeleted
                ? await _rewardRepository.GetByIdAsync(id)
                : await _rewardRepository.GetActiveByIdAsync(id);

            return RewardDTO.Create(reward);
        }

        public async Task<List<RewardDTO>> GetAllRewardsAsync(bool includesoftdeleted = false)
        {
            var rewards = includesoftdeleted
                ? await _rewardRepository.GetAllAsync()
                : await _rewardRepository.GetActiveAllAsync();

            return RewardDTO.CreateList(rewards);
        }

        public async Task<List<RewardDTO>> GetRewardsByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return new List<RewardDTO>();
            }
            var rewards = await _rewardRepository.GetActiveByNameAsync(name);
            return RewardDTO.CreateList(rewards);
        }

        public async Task<RewardDTO> CreateRewardAsync(CreationRewardDTO rewarddto)
        {
            var rewardEntity = new Reward
            {
                Name = rewarddto.Name,
                Description = rewarddto.Description,
                PointsRequired = rewarddto.PointsRequired,
                Stock = rewarddto.Stock,
                ImageUrl = rewarddto.ImageUrl
            };

            var newReward = await _rewardRepository.AddAsync(rewardEntity);
            return RewardDTO.Create(newReward);
        }

        public async Task<bool> UpdateRewardAsync(int id, UpdateRewardDTO rewarddto)
        {
            var existingReward = await _rewardRepository.GetActiveByIdAsync(id);
            if (existingReward == null)
            {
                return false;
            }

            existingReward.Name = rewarddto.Name;
            existingReward.Description = rewarddto.Description;
            existingReward.PointsRequired = rewarddto.PointsRequired;
            existingReward.Stock = rewarddto.Stock;
            existingReward.ImageUrl = rewarddto.ImageUrl;

            await _rewardRepository.UpdateAsync(existingReward);
            return true;
        }

        public async Task<RewardDTO> PartialUpdateRewardAsync(int id, RewardStockAndPointsDTO rewarddto)
        {
            var existingReward = await _rewardRepository.GetActiveByIdAsync(id);
            if (existingReward == null)
            {
                return null;
            }

            if (rewarddto.PointsRequired.HasValue)
            {
                existingReward.PointsRequired = rewarddto.PointsRequired.Value;
            }

            if (rewarddto.Stock.HasValue)
            {
                existingReward.Stock = rewarddto.Stock.Value;
            }

            await _rewardRepository.UpdateAsync(existingReward);
            return RewardDTO.Create(existingReward);
        }

        public async Task<bool> DeleteRewardAsync(int id, bool permanently = false)
        {
            if (permanently)
            {
                var reward = await _rewardRepository.GetByIdAsync(id);
                if (reward == null) return false;
                await _rewardRepository.DeletePermanentlyAsync(reward);
                return true;
            }
            else
            {
                var reward = await _rewardRepository.GetActiveByIdAsync(id);
                if (reward == null) return false;
                await _rewardRepository.DeleteSoftAsync(reward);
                return true;
            }
        }

        public async Task<RewardDTO> RestoreRewardAsync(int id)
        {
            var reward = await _rewardRepository.GetByIdAsync(id);

            if (reward == null || reward.IsDeleted == false)
            {
                return null;
            }

            await _rewardRepository.RestoreAsync(reward);
            return RewardDTO.Create(reward);
        }
    }
}