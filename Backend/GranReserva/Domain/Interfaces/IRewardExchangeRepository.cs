using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IRewardExchangeRepository : IRepositoryBase<RewardExchange>
    {
        Task<RewardExchange> GetActiveByIdAsync(int id);
        Task<List<RewardExchange>> GetActiveAllAsync();
        Task<List<RewardExchange>> GetActiveExchangesByClientIdAsync(int clientId);
        Task DeleteSoftAsync(RewardExchange exchange);
        Task RestoreAsync(RewardExchange exchange);
    }
}