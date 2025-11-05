using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.RewardExchangeDTO
{
    public class CreationRewardExchangeDTO
    {
        [Required(ErrorMessage = "El ID del cliente es obligatorio.")]
        public int ClientId { get; set; }

        [Required(ErrorMessage = "El ID de la recompensa es obligatorio.")]
        public int RewardId { get; set; }
    }
}