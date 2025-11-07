using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProductRepository : RepositoryBase<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Product>> GetActiveAllAsync()
        {
            return await _dbSet
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<Product> GetActiveByIdAsync(int id)
        {
            return await _dbSet
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<List<Product>> GetActiveByNameAsync(string name)
        {
            var nameLower = name.ToLower();
            return await _dbSet
                .Where(p => !p.IsDeleted && p.Name.ToLower().Contains(nameLower))
                .ToListAsync();
        }

        public async Task<List<Product>> GetActiveByTypeAsync(ProductType type)
        {
            return await _dbSet
                .Where(p => !p.IsDeleted && p.Type == type)
                .ToListAsync();
        }

        public async Task DeleteSoftAsync(Product product)
        {
            product.IsDeleted = true;
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RestoreAsync(Product product)
        {
            product.IsDeleted = false;
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}