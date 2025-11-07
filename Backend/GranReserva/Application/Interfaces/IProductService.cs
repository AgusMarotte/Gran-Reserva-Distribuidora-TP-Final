using Application.Models;
using Application.Models.Request.ProductDTO;
using Domain.Enums;

namespace Application.Interfaces
{
    public interface IProductService
    {
        Task<ProductDTO?> GetProductByIdAsync(int id, bool includesoftdeleted = false);
        Task<List<ProductDTO>> GetAllProductsAsync(bool includesoftdeleted = false);
        Task<List<ProductDTO>> GetProductsByNameAsync(string name);
        Task<List<ProductDTO>> GetProductsByTypeAsync(ProductType type);
        Task<ProductDTO> CreateProductAsync(CreationProductDTO productdto);
        Task<bool> UpdateProductAsync(int id, UpdateProductDTO productdto);
        Task<ProductDTO?> PartialUpdateProductAsync(int id, ProductStockAndPriceDTO productdto);
        Task<bool> DeleteProductAsync(int id, bool permanently = false);
        Task<ProductDTO?> RestoreProductAsync(int id);
    }
}