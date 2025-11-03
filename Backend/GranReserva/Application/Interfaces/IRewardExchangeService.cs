using Domain.Entities;

namespace Application.Interfaces
{
    public interface IRewardExchangeService
    {
        Task<RewardExchange> GetExchangeByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<RewardExchange>> GetAllExchangesAsync(bool includesoftdeleted = false);
        Task<List<RewardExchange>> GetExchangesByClientIdAsync(int clientId);
        Task<RewardExchange> CreateExchangeAsync(RewardExchange exchange);
        Task<bool> DeleteExchangeAsync(int id, bool permanently = false);
        Task<RewardExchange> RestoreExchangeAsync(int id);
    }
}