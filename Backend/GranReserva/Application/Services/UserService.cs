using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDTO> GetUserByIdAsync(int id, bool includesoftdeleted = false)
        {
            var user = includesoftdeleted
                ? await _userRepository.GetByIdAsync(id)
                : await _userRepository.GetActiveByIdAsync(id);
            
            return UserDTO.Create(user);
        }

        public async Task<List<UserDTO>> GetAllUsersAsync(bool includesoftdeleted = false)
        {
            var users = includesoftdeleted
                ? await _userRepository.GetAllAsync()
                : await _userRepository.GetActiveAllAsync();

            return UserDTO.CreateList(users);
        }

        public async Task<UserDTO> GetUserByNameAndLastNameAsync(string name, string lastName)
        {
            var user = await _userRepository.GetByNameAndLastNameAsync(name, lastName);
            return UserDTO.Create(user);
        }

        public async Task<UserDTO> CreateUserAsync(CreationUserDTO userdto)
        {
            var userEntity = new User
            {
                Name = userdto.Name,
                LastName = userdto.LastName,
                PhoneNumber = userdto.PhoneNumber,
                Email = userdto.Email,
                Password = userdto.Password,
                Role = UserRole.User
            };

            var newUser = await _userRepository.AddAsync(userEntity);
            return UserDTO.Create(newUser);
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserDTO userdto)
        {
            var existingUser = await _userRepository.GetActiveByIdAsync(id);
            if (existingUser == null)
            {
                return false;
            }

            existingUser.Name = userdto.Name;
            existingUser.LastName = userdto.LastName;
            existingUser.PhoneNumber = userdto.PhoneNumber;
            existingUser.Email = userdto.Email;

            await _userRepository.UpdateAsync(existingUser);
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id, bool permanently = false)
        {
            if (permanently)
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null) return false;
                await _userRepository.DeletePermanentlyAsync(user);
                return true;
            }
            else
            {
                var user = await _userRepository.GetActiveByIdAsync(id);
                if (user == null) return false;
                await _userRepository.DeleteSoftAsync(user);
                return true;
            }
        }

        public async Task<UserDTO> RestoreUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null || user.IsDeleted == false)
            {
                return null;
            }

            await _userRepository.RestoreAsync(user);
            return UserDTO.Create(user);
        }
    }
}