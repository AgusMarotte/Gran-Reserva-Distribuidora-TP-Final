using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces
{
    public interface IProductRepository : IRepositoryBase<Product>
    {
        Task<Product> GetActiveByIdAsync(int id);
        Task<List<Product>> GetActiveAllAsync();
        Task<List<Product>> GetActiveByNameAsync(string name);
        Task<List<Product>> GetActiveByTypeAsync(ProductType type);
        Task DeleteSoftAsync(Product product);
        Task RestoreAsync(Product product);
    }
}