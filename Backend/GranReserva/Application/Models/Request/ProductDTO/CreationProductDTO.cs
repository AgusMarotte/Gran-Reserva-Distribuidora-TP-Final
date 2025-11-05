using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.ProductDTO
{
    public class CreationProductDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "El tipo de producto es obligatorio.")]
        public ProductType Type { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "El precio no puede ser negativo.")]
        public int Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
        public int Stock { get; set; }

        [Required(ErrorMessage = "La URL de la imagen es obligatoria.")]
        [Url(ErrorMessage = "El formato de la ImageUrl no es válido.")]
        public string ImageUrl { get; set; }
    }
}