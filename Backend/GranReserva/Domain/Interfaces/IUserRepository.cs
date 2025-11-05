using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IUserRepository : IRepositoryBase<User>
    {
        Task<User> GetActiveByIdAsync(int id);
        Task<List<User>> GetActiveAllAsync();
        Task DeleteSoftAsync(User user);
        Task RestoreAsync(User user);
        Task<List<User>> GetUsersByNameOrLastNameAsync(string? name, string? lastName);
    }
}