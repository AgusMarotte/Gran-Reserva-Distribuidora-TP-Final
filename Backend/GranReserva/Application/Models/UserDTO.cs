using Domain.Entities;
using Domain.Enums;

namespace Application.Models
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public int? Points { get; set; }

        public static UserDTO Create(User user)
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
            var dtoList = new List<UserDTO>();
            foreach (var u in userList)
            {
                dtoList.Add(Create(u));
            }
            return dtoList;
        }
    }
}