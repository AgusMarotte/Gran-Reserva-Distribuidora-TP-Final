using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly List<User> _users = new List<User>
        {
            new User 
            { 
                Id = 1, 
                Name = "Juan", 
                LastName = "Perez", 
                Email = "juan.perez@email.com", 
                Password = "123456789", 
                PhoneNumber = "341000111", 
                Role = UserRole.Admin 
            },
            new User 
            { 
                Id = 2, 
                Name = "Maria", 
                LastName = "Gomez", 
                Email = "maria.gomez@email.com", 
                Password = "asdasdasd", 
                PhoneNumber = "341000222", 
                Role = UserRole.User 
            }
        };

        public async Task<User> GetByIdAsync(int id)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            return await Task.FromResult(user);
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await Task.FromResult(_users);
        }
    }
}