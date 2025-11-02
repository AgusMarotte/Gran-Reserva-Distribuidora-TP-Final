using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Repositories
{
    public class RewardRepository : IRewardRepository
    {
        private readonly List<Reward> _rewards = new List<Reward>
        {
            new Reward
            {
                Id = 1,
                Name = "Gorra Gran Reserva",
                Description = "Gorra de edición limitada.",
                PointsRequired = 500,
                Stock = 100,
                ImageUrl = "https://placehold.co/600x400?text=Gorra+Gran+Reserva"
            },
            new Reward
            {
                Id = 2,
                Name = "Descuento 15%",
                Description = "15% de descuento en tu próxima compra.",
                PointsRequired = 1000,
                Stock = 50,
                ImageUrl = "https://placehold.co/600x400?text=Descuento+15%"
            }
        };

        public async Task<Reward> GetByIdAsync(int id)
        {
            var reward = _rewards.FirstOrDefault(r => r.Id == id);
            return await Task.FromResult(reward);
        }

        public async Task<List<Reward>> GetAllAsync()
        {
            return await Task.FromResult(_rewards);
        }
    }
}