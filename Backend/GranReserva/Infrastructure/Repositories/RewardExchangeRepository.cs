using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class RewardExchangeRepository : RepositoryBase<RewardExchange>, IRewardExchangeRepository
    {
        public RewardExchangeRepository(ApplicationDbContext context) : base(context)
        {
        }

        private IQueryable<RewardExchange> GetActiveQuery()
        {
            return _dbSet
                .Include(e => e.Client)
                .Include(e => e.Reward)
                .Where(e => !e.IsDeleted);
        }

        public override async Task<RewardExchange> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(e => e.Client)
                .Include(e => e.Reward)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<RewardExchange> GetActiveByIdAsync(int id)
        {
            return await GetActiveQuery()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<RewardExchange>> GetActiveAllAsync()
        {
            return await GetActiveQuery().ToListAsync();
        }

        public async Task<List<RewardExchange>> GetActiveExchangesByClientIdAsync(int clientId)
        {
            return await GetActiveQuery()
                .Where(e => e.ClientId == clientId)
                .ToListAsync();
        }

        public async Task DeleteSoftAsync(RewardExchange exchange)
        {
            exchange.IsDeleted = true;
            _context.Entry(exchange).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RestoreAsync(RewardExchange exchange)
        {
            exchange.IsDeleted = false;
            _context.Entry(exchange).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}