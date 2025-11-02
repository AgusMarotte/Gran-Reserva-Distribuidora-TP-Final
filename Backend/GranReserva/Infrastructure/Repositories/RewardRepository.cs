using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class RewardRepository : IRewardRepository
    {
        private readonly ApplicationDbContext _context;

        public RewardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Reward> GetByIdAsync(int id)
        {
            return await _context.Rewards.FindAsync(id);
        }

        public async Task<List<Reward>> GetAllAsync()
        {
            return await _context.Rewards.ToListAsync();
        }
    }
}