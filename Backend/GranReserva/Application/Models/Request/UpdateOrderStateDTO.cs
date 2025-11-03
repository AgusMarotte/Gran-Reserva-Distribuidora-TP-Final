using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request
{
    public class UpdateOrderStateDTO
    {
        [Required(ErrorMessage = "El nuevo estado es obligatorio.")]
        public OrderStatus NewState { get; set; }
    }
}