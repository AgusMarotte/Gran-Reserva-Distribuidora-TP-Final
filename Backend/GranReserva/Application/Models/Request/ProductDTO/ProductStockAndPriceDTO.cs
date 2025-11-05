using System.ComponentModel.DataAnnotations;


namespace Application.Models.Request.ProductDTO
{
    public class ProductStockAndPriceDTO
    {
        [Range(0, int.MaxValue, ErrorMessage = "El precio no puede ser negativo.")]
        public int? Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
        public int? Stock { get; set; }
    }
}
