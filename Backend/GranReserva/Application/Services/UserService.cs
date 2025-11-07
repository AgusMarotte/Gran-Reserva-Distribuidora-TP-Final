using Application.Interfaces;
using Application.Models;
using Application.Models.Request.UserDTO;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }

                return builder.ToString();
            }
        }

        public async Task<UserDTO> GetUserByIdAsync(int id, bool includesoftdeleted = false)
        {
            var user = includesoftdeleted
                ? await _userRepository.GetByIdAsync(id)
                : await _userRepository.GetActiveByIdAsync(id);

            return UserDTO.Create(user)!;
        }

        public async Task<List<UserDTO>> GetAllUsersAsync(bool includesoftdeleted = false)
        {
            var users = includesoftdeleted
                ? await _userRepository.GetAllAsync()
                : await _userRepository.GetActiveAllAsync();

            return UserDTO.CreateList(users);
        }

        public async Task<List<UserDTO>> GetUsersByNameOrLastNameAsync(string? name, string? lastName)
        {
            var users = await _userRepository.GetUsersByNameOrLastNameAsync(name, lastName);
            return UserDTO.CreateList(users);
        }

        public async Task<UserDTO> CreateUserAsync(CreationUserDTO userdto)
        {
            var existingUser = await _userRepository.GetActiveByEmailAsync(userdto.Email);
            if (existingUser != null)
            {
                throw new ValidationException("El email ya está en uso.");
            }

            bool anyUserExists = await _userRepository.AnyUserExistsAsync();

            var hashedPassword = ComputeSha256Hash(userdto.Password);

            User newUser;

            if (anyUserExists)
            {
                newUser = new Client
                {
                    Name = userdto.Name,
                    LastName = userdto.LastName,
                    PhoneNumber = userdto.PhoneNumber,
                    Email = userdto.Email,
                    Password = hashedPassword,
                    Role = UserRole.User,
                    Points = 0
                };
            }
            else
            {
                newUser = new User
                {
                    Name = userdto.Name,
                    LastName = userdto.LastName,
                    PhoneNumber = userdto.PhoneNumber,
                    Email = userdto.Email,
                    Password = hashedPassword,
                    Role = UserRole.SuperAdmin
                };
            }

            var createdUser = await _userRepository.AddAsync(newUser);
            return UserDTO.Create(createdUser)!;
        }

        public async Task<UserDTO> CreateAdminAsync(CreationUserDTO userdto, UserRole role)
        {
            if (role != UserRole.Admin && role != UserRole.SuperAdmin)
            {
                throw new ValidationException("Rol inválido para creación de administrador.");
            }

            var existingUser = await _userRepository.GetActiveByEmailAsync(userdto.Email);
            if (existingUser != null)
            {
                throw new ValidationException("El email ya está en uso.");
            }

            var hashedPassword = ComputeSha256Hash(userdto.Password);

            var userEntity = new User
            {
                Name = userdto.Name,
                LastName = userdto.LastName,
                PhoneNumber = userdto.PhoneNumber,
                Email = userdto.Email,
                Password = hashedPassword,
                Role = role,
            };

            var newUser = await _userRepository.AddAsync(userEntity);
            return UserDTO.Create(newUser)!;
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
                return null!;
            }

            await _userRepository.RestoreAsync(user);
            return UserDTO.Create(user)!;
        }

        public async Task<UserDTO> UpdateClientPointsAsync(int clientId, UpdatePointsDTO dto)
        {
            var user = await _userRepository.GetActiveByIdAsync(clientId);
            if (user == null)
            {
                return null!;
            }

            if (user is not Client client)
            {
                throw new ValidationException($"El usuario con id {clientId} no es un Cliente, no se pueden modificar puntos.");
            }

            switch (dto.Operation)
            {
                case PointOperationType.Add:
                    client.Points += dto.Amount;
                    break;

                case PointOperationType.Subtract:
                    if (client.Points < dto.Amount)
                    {
                        throw new ValidationException($"El cliente solo tiene {client.Points} puntos. No se pueden descontar {dto.Amount}.");
                    }
                    client.Points -= dto.Amount;
                    break;

                case PointOperationType.Set:
                    client.Points = dto.Amount;
                    break;
            }

            await _userRepository.UpdateAsync(client);

            return UserDTO.Create(client)!;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDTO)
        {
            var user = await _userRepository.GetActiveByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var hashedPassword = ComputeSha256Hash(changePasswordDTO.CurrentPassword);
            if (user.Password != hashedPassword)
            {
                throw new ValidationException("La contraseña actual es incorrecta.");
            }

            user.Password = ComputeSha256Hash(changePasswordDTO.NewPassword);
            await _userRepository.UpdateAsync(user);

            return true;
        }
    }
}