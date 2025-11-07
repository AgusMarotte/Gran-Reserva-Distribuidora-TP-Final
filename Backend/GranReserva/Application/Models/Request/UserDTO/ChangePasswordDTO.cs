using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.UserDTO
{
    public class ChangePasswordDTO
    {
        [Required(ErrorMessage = "La contraseña actual es obligatoria.")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
        [MinLength(8, ErrorMessage = "La nueva contraseña debe tener al menos 8 caracteres.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}