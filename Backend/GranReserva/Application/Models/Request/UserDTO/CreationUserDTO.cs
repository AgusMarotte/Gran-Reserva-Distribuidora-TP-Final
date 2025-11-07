using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.UserDTO
{
    public class CreationUserDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [RegularExpression(@"^[\p{L}\s]+$", ErrorMessage = "El campo solo puede contener letras.")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio.")]
        [RegularExpression(@"^[\p{L}\s]+$", ErrorMessage = "El campo solo puede contener letras.")]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [RegularExpression("^[0-9]{10}$", ErrorMessage = "El número de teléfono debe tener 10 dígitos.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
        public string Password { get; set; } = string.Empty;
    }
}