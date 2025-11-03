using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class RewardRepository : RepositoryBase<Reward>, IRewardRepository
    {
        public RewardRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Reward>> GetActiveAllAsync()
        {
            return await _dbSet
                .Where(r => !r.IsDeleted)
                .ToListAsync();
        }

        public async Task<Reward> GetActiveByIdAsync(int id)
        {
            return await _dbSet
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        }
        
        public async Task DeleteSoftAsync(Reward reward)
        {
            reward.IsDeleted = true;
            _context.Entry(reward).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RestoreAsync(Reward reward)
        {
            reward.IsDeleted = false;
            _context.Entry(reward).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}