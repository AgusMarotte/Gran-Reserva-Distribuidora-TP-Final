using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.UserDTO
{
    public enum PointOperationType
    {
        Add,
        Subtract,
        Set
    }

    public class UpdatePointsDTO
    {
        [Required(ErrorMessage = "El tipo de operación es obligatorio.")]
        public PointOperationType Operation { get; set; }

        [Required(ErrorMessage = "La cantidad de puntos es obligatoria.")]
        [Range(0, long.MaxValue, ErrorMessage = "La cantidad debe ser un valor positivo.")]
        public long Amount { get; set; }
    }
}