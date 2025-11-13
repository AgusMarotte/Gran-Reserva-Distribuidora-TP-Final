using Application.Models;
using Application.Models.Request.UserDTO;
using Domain.Enums;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO> GetUserByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<UserDTO>> GetAllUsersAsync(bool includesoftdeleted = false);
        Task<List<UserDTO>> GetUsersByNameOrLastNameAsync(string? name, string? lastName);
        Task<UserDTO> CreateUserAsync(CreationUserDTO userdto);
        Task<UserDTO> CreateAdminAsync(CreationUserDTO userdto, UserRole role);
        Task<bool> UpdateUserAsync(int id, UpdateUserDTO userdto);
        Task<bool> DeleteUserAsync(int id, bool permanently = false);
        Task<UserDTO> RestoreUserAsync(int id);
        Task<UserDTO> UpdateClientPointsAsync(int clientId, UpdatePointsDTO pointsdto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDTO);
        Task<long> GetUserPointsAsync(int userId);
        Task<UserDTO> GetCurrentUserProfileAsync(int userId);
    }
}