using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IProductRepository : IRepositoryBase<Product>
    {
        Task<Product> GetActiveByIdAsync(int id);
        Task<List<Product>> GetActiveAllAsync();
        Task DeleteSoftAsync(Product product);
        Task RestoreAsync(Product product);
    }
}