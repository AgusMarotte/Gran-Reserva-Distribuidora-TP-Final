using Application.Models;
using Application.Models.Request;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO> GetUserByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<UserDTO>> GetAllUsersAsync(bool includesoftdeleted = false);
        Task<UserDTO> GetUserByNameAndLastNameAsync(string name, string lastName);
        Task<UserDTO> CreateUserAsync(CreationUserDTO userdto);
        Task<bool> UpdateUserAsync(int id, UpdateUserDTO userdto);
        Task<bool> DeleteUserAsync(int id, bool permanently = false);
        Task<UserDTO> RestoreUserAsync(int id);
        Task<UserDTO> UpdateClientPointsAsync(int clientId, UpdatePointsDTO pointsdto);
    }
}