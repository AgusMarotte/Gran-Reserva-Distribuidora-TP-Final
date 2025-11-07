using Application.Interfaces;
using Application.Models;
using Application.Models.Request.ProductDTO;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<ProductDTO?> GetProductByIdAsync(int id, bool includesoftdeleted = false)
        {
            var product = includesoftdeleted
                ? await _productRepository.GetByIdAsync(id)
                : await _productRepository.GetActiveByIdAsync(id);

            return ProductDTO.Create(product);
        }

        public async Task<List<ProductDTO>> GetAllProductsAsync(bool includesoftdeleted = false)
        {
            var products = includesoftdeleted
                ? await _productRepository.GetAllAsync()
                : await _productRepository.GetActiveAllAsync();

            return ProductDTO.CreateList(products);
        }

        public async Task<List<ProductDTO>> GetProductsByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return new List<ProductDTO>();
            }
            var products = await _productRepository.GetActiveByNameAsync(name);
            return ProductDTO.CreateList(products);
        }

        public async Task<List<ProductDTO>> GetProductsByTypeAsync(ProductType type)
        {
            var products = await _productRepository.GetActiveByTypeAsync(type);
            return ProductDTO.CreateList(products);
        }

        public async Task<ProductDTO> CreateProductAsync(CreationProductDTO productdto)
        {
            var productEntity = new Product
            {
                Name = productdto.Name,
                Type = productdto.Type,
                Price = productdto.Price,
                Stock = productdto.Stock,
                ImageUrl = productdto.ImageUrl
            };

            var newProduct = await _productRepository.AddAsync(productEntity);
            return ProductDTO.Create(newProduct)!;
        }

        public async Task<bool> UpdateProductAsync(int id, UpdateProductDTO productdto)
        {
            var existingProduct = await _productRepository.GetActiveByIdAsync(id);
            if (existingProduct == null)
            {
                return false;
            }

            existingProduct.Name = productdto.Name;
            existingProduct.Type = productdto.Type;
            existingProduct.Price = productdto.Price;
            existingProduct.Stock = productdto.Stock;
            existingProduct.ImageUrl = productdto.ImageUrl;

            await _productRepository.UpdateAsync(existingProduct);
            return true;
        }

        public async Task<ProductDTO?> PartialUpdateProductAsync(int id, ProductStockAndPriceDTO productdto)
        {
            var existingProduct = await _productRepository.GetActiveByIdAsync(id);
            if (existingProduct == null)
            {
                return null;
            }

            if (productdto.Price.HasValue)
            {
                existingProduct.Price = (int)productdto.Price.Value;
            }

            if (productdto.Stock.HasValue)
            {
                existingProduct.Stock = (int)productdto.Stock.Value;
            }

            await _productRepository.UpdateAsync(existingProduct);
            return ProductDTO.Create(existingProduct);
        }

        public async Task<bool> DeleteProductAsync(int id, bool permanently = false)
        {
            if (permanently)
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null)
                {
                    return false;
                }
                await _productRepository.DeletePermanentlyAsync(product);
                return true;
            }
            else
            {
                var product = await _productRepository.GetActiveByIdAsync(id);
                if (product == null)
                {
                    return false;
                }
                await _productRepository.DeleteSoftAsync(product);
                return true;
            }
        }

        public async Task<ProductDTO?> RestoreProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
            {
                return null;
            }

            if (product.IsDeleted == false)
            {
                return null;
            }

            await _productRepository.RestoreAsync(product);

            return ProductDTO.Create(product);
        }
    }
}