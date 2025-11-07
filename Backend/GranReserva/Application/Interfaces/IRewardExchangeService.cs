using Application.Models;
using Application.Models.Request.RewardExchangeDTO;

namespace Application.Interfaces
{
    public interface IRewardExchangeService
    {
        Task<RewardExchangeDTO> GetExchangeByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<RewardExchangeDTO>> GetAllExchangesAsync(bool includesoftdeleted = false);
        Task<List<RewardExchangeDTO>> GetExchangesByClientIdAsync(int clientId);
        Task<RewardExchangeDTO> CreateExchangeAsync(CreationRewardExchangeDTO exchangedto, int clientId);
        Task<bool> DeleteExchangeAsync(int id, bool permanently = false);
        Task<RewardExchangeDTO> RestoreExchangeAsync(int id);
    }
}