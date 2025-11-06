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

        public async Task<List<User>> GetUsersByNameOrLastNameAsync(string? name, string? lastName)
        {
            var query = _dbSet.Where(u => !u.IsDeleted);

            bool hasName = !string.IsNullOrEmpty(name);
            bool hasLastName = !string.IsNullOrEmpty(lastName);

            if (hasName && hasLastName)
            {
                string lowerName = name.ToLower();
                string lowerLastName = lastName.ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(lowerName) &&
                    u.LastName.ToLower().Contains(lowerLastName));
            }
            else if (hasName)
            {
                string lowerName = name.ToLower();
                query = query.Where(u => u.Name.ToLower().Contains(lowerName));
            }
            else if (hasLastName)
            {
                string lowerLastName = lastName.ToLower();
                query = query.Where(u => u.LastName.ToLower().Contains(lowerLastName));
            }

            return await query.ToListAsync();
        }

        public async Task<User> GetActiveByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        }

        public async Task<bool> AnyUserExistsAsync()
        {
            return await _dbSet.AnyAsync();
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