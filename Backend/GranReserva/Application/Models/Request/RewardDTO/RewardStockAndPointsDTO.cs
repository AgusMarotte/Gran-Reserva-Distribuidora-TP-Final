using System.ComponentModel.DataAnnotations;


namespace Application.Models.Request.RewardDTO
{
    public class RewardStockAndPointsDTO
    {
        [Range(0, long.MaxValue, ErrorMessage = "Los puntos no pueden ser negativos.")]
        public long? PointsRequired { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
        public int? Stock { get; set; }
    }
}
