using Application.Interfaces;
using Application.Models;
using Application.Models.Request.RewardExchangeDTO;
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
        private readonly IUserRepository _userRepository;

        public RewardExchangeService(
            IRewardExchangeRepository exchangeRepository,
            IRewardRepository rewardRepository,
            IClientRepository clientRepository,
            IUserRepository userRepository)
        {
            _exchangeRepository = exchangeRepository;
            _rewardRepository = rewardRepository;
            _clientRepository = clientRepository;
            _userRepository = userRepository;
        }

        public async Task<RewardExchangeDTO> GetExchangeByIdAsync(int id, bool includesoftdeleted = false)
        {
            var exchange = includesoftdeleted
                ? await _exchangeRepository.GetByIdAsync(id)
                : await _exchangeRepository.GetActiveByIdAsync(id);

            return RewardExchangeDTO.Create(exchange);
        }

        public async Task<List<RewardExchangeDTO>> GetAllExchangesAsync(bool includesoftdeleted = false)
        {
            var exchanges = includesoftdeleted
                ? await _exchangeRepository.GetAllAsync()
                : await _exchangeRepository.GetActiveAllAsync();

            return RewardExchangeDTO.CreateList(exchanges);
        }

        public async Task<List<RewardExchangeDTO>> GetExchangesByClientIdAsync(int clientId)
        {
            var exchanges = await _exchangeRepository.GetActiveExchangesByClientIdAsync(clientId);
            return RewardExchangeDTO.CreateList(exchanges);
        }

        public async Task<RewardExchangeDTO> CreateExchangeAsync(CreationRewardExchangeDTO exchangedto, int clientId)
        {
            //Validar Cliente
            var client = await _clientRepository.GetByIdAsync(clientId);

            if (client == null)
            {
                var user = await _userRepository.GetActiveByIdAsync(clientId);
                if (user != null)
                {
                    throw new ValidationException($"El usuario con ID {clientId} es un '{user.Role}' y no puede realizar canjes.");
                }
                throw new NotFoundException($"No se encontró ningún cliente con ID {clientId}.");
            }

            if (client.IsDeleted)
            {
                throw new ValidationException("El cliente no está activo.");
            }

            //Validar Reward
            var reward = await _rewardRepository.GetActiveByIdAsync(exchangedto.RewardId);
            if (reward == null)
            {
                throw new NotFoundException($"La recompensa con ID {exchangedto.RewardId} no existe o no está activa.");
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

            //Crear la entidad de canje
            var exchangeEntity = new RewardExchange
            {
                ClientId = clientId,
                RewardId = exchangedto.RewardId,
                PointsUsed = reward.PointsRequired,
                Date = DateTime.UtcNow
            };

            var createdExchange = await _exchangeRepository.AddAsync(exchangeEntity);

            //Obtener la entidad completa y mapear a DTO
            var fullExchange = await _exchangeRepository.GetActiveByIdAsync(createdExchange.Id);
            return RewardExchangeDTO.Create(fullExchange);
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

        public async Task<RewardExchangeDTO> RestoreExchangeAsync(int id)
        {
            var exchange = await _exchangeRepository.GetByIdAsync(id);
            if (exchange == null || exchange.IsDeleted == false)
            {
                return null;
            }

            await _exchangeRepository.RestoreAsync(exchange);
            return RewardExchangeDTO.Create(exchange);
        }
    }
}