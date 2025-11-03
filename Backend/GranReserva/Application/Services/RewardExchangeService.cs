using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;

namespace Application.Services
{
    public class RewardExchangeService : IRewardExchangeService
    {
        private readonly IRewardExchangeRepository _exchangeRepository;
        private readonly IRewardRepository _rewardRepository;
        private readonly IClientRepository _clientRepository;

        public RewardExchangeService(
            IRewardExchangeRepository exchangeRepository, 
            IRewardRepository rewardRepository, 
            IClientRepository clientRepository)
        {
            _exchangeRepository = exchangeRepository;
            _rewardRepository = rewardRepository;
            _clientRepository = clientRepository;
        }

        public async Task<RewardExchange> GetExchangeByIdAsync(int id, bool includesoftdeleted = false)
        {
            var exchange = includesoftdeleted
                ? await _exchangeRepository.GetByIdAsync(id)
                : await _exchangeRepository.GetActiveByIdAsync(id);
            return exchange;
        }

        public async Task<List<RewardExchange>> GetAllExchangesAsync(bool includesoftdeleted = false)
        {
            var exchanges = includesoftdeleted
                ? await _exchangeRepository.GetAllAsync()
                : await _exchangeRepository.GetActiveAllAsync();
            return exchanges;
        }

        public async Task<List<RewardExchange>> GetExchangesByClientIdAsync(int clientId)
        {
            return await _exchangeRepository.GetActiveExchangesByClientIdAsync(clientId);
        }

        public async Task<RewardExchange> CreateExchangeAsync(RewardExchange exchange)
        {
            //Validar Cliente
            var client = await _clientRepository.GetByIdAsync(exchange.ClientId);
            if (client == null || client.IsDeleted)
            {
                throw new ValidationException("El cliente no existe o no está activo.");
            }

            //Validar Reward
            var reward = await _rewardRepository.GetActiveByIdAsync(exchange.RewardId);
            if (reward == null)
            {
                throw new NotFoundException($"La recompensa con ID {exchange.RewardId} no existe o no está activa.");
            }

            //Validar Stock
            if (reward.Stock <= 0)
            {
                throw new ValidationException($"No hay stock suficiente para '{reward.Name}'.");
            }

            //Validar Puntos
            if (client.Points < reward.PointsRequired)
            {
                throw new ValidationException($"El cliente no tiene puntos suficientes. Puntos requeridos: {reward.PointsRequired}");
            }

            //Aplicar transacción
            client.Points -= reward.PointsRequired;
            reward.Stock -= 1;

            await _clientRepository.UpdateAsync(client);
            await _rewardRepository.UpdateAsync(reward);

            //Crear el canje
            exchange.PointsUsed = reward.PointsRequired;
            exchange.Date = DateTime.UtcNow;

            return await _exchangeRepository.AddAsync(exchange);
        }

        public async Task<bool> DeleteExchangeAsync(int id, bool permanently = false)
        {
            if (permanently)
            {
                var exchange = await _exchangeRepository.GetByIdAsync(id);
                if (exchange == null) return false;
                await _exchangeRepository.DeletePermanentlyAsync(exchange);
                return true;
            }
            else
            {
                var exchange = await _exchangeRepository.GetActiveByIdAsync(id);
                if (exchange == null) return false;
                await _exchangeRepository.DeleteSoftAsync(exchange);
                return true;
            }
        }

        public async Task<RewardExchange> RestoreExchangeAsync(int id)
        {
            var exchange = await _exchangeRepository.GetByIdAsync(id);
            if (exchange == null || exchange.IsDeleted == false)
            {
                return null;
            }
            await _exchangeRepository.RestoreAsync(exchange);
            return exchange;
        }
    }
}