using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.RewardDTO
{
    public class CreationRewardDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los puntos son obligatorios.")]
        [Range(0, long.MaxValue, ErrorMessage = "Los puntos no pueden ser negativos.")]
        public long PointsRequired { get; set; } = 0;

        [Required(ErrorMessage = "El stock es obligatorio.")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
        public int Stock { get; set; } = 0;

        [Required(ErrorMessage = "La URL de la imagen es obligatoria.")]
        [Url(ErrorMessage = "El formato de la ImageUrl no es válido.")]
        public string ImageUrl { get; set; } = string.Empty;
    }
}