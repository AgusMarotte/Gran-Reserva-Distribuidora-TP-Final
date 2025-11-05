using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.OrderDTO
{
    public class CreationOrderDTO
    {
        [Required]
        public int ClientId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "La orden debe tener al menos un item.")]
        public List<CreationOrderDetailDTO> Items { get; set; }
    }

    public class CreationOrderDetailDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1.")]
        public int Amount { get; set; }
    }
}