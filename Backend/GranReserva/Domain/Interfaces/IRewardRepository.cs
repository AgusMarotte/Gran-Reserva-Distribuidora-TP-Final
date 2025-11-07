using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IRewardRepository : IRepositoryBase<Reward>
    {
        Task<Reward> GetActiveByIdAsync(int id);
        Task<List<Reward>> GetActiveAllAsync();
        Task<List<Reward>> GetActiveByNameAsync(string name);
        Task DeleteSoftAsync(Reward reward);
        Task RestoreAsync(Reward reward);
    }
}