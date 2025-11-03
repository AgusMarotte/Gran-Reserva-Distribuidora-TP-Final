using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class OrderRepository : RepositoryBase<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
        }

        private IQueryable<Order> GetActiveQuery()
        {
            return _dbSet
                .Include(o => o.Client)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Where(o => !o.IsDeleted);
        }

        public override async Task<Order> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(o => o.Client)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Order> GetActiveByIdAsync(int id)
        {
            return await GetActiveQuery()
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Order>> GetActiveAllAsync()
        {
            return await GetActiveQuery().ToListAsync();
        }

        public async Task<List<Order>> GetActiveOrdersByClientIdAsync(int clientId)
        {
            return await GetActiveQuery()
                .Where(o => o.ClientId == clientId)
                .ToListAsync();
        }

        public async Task DeleteSoftAsync(Order order)
        {
            order.IsDeleted = true;
            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RestoreAsync(Order order)
        {
            order.IsDeleted = false;
            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}