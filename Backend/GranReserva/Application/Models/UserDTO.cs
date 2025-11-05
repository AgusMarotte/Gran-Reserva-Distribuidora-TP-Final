using Domain.Entities;
using Domain.Enums;

namespace Application.Models
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public long? Points { get; set; }

        public static UserDTO? Create(User user)
        {
            if (user == null)
            {
                return null;
            }

            var dto = new UserDTO();
            dto.Id = user.Id;
            dto.Name = user.Name;
            dto.LastName = user.LastName;
            dto.PhoneNumber = user.PhoneNumber;
            dto.Email = user.Email;
            dto.Role = user.Role;

            if (user is Client client)
            {
                dto.Points = client.Points;
            }

            return dto;
        }

        public static List<UserDTO> CreateList(List<User> userList)
        {
            return userList.Select(Create).OfType<UserDTO>().ToList();
        }
    }
}