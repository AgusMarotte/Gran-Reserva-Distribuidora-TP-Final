using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IRewardRepository
    {
        Task<Reward> GetByIdAsync(int id);
        Task<List<Reward>> GetAllAsync();
    }
}