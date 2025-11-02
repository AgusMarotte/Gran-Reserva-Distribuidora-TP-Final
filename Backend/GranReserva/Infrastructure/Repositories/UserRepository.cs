using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository : RepositoryBase<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<User>> GetActiveAllAsync()
        {
            return await _dbSet
                .Where(u => !u.IsDeleted)
                .ToListAsync();
        }

        public async Task<User> GetActiveByIdAsync(int id)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        }

        public async Task<User> GetByNameAndLastNameAsync(string name, string lastName)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Name == name && u.LastName == lastName && !u.IsDeleted);
        }
        
        public async Task DeleteSoftAsync(User user)
        {
            user.IsDeleted = true;
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RestoreAsync(User user)
        {
            user.IsDeleted = false;
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}