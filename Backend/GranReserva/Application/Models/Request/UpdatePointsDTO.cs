using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request
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
        [Range(0, int.MaxValue, ErrorMessage = "La cantidad debe ser un valor positivo.")]
        public int Amount { get; set; }
    }
}