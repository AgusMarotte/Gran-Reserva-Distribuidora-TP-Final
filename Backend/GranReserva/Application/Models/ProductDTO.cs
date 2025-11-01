using Domain.Entities;
using Domain.Enums;

namespace Application.Models
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ProductType Type { get; set; }
        public int Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; }

        public static ProductDTO Create(Product product)
        {
            if (product == null)
            {
                return null;
            }

            var dto = new ProductDTO();
            dto.Id = product.Id;
            dto.Name = product.Name;
            dto.Type = product.Type;
            dto.Price = product.Price;
            dto.Stock = product.Stock;
            dto.ImageUrl = product.ImageUrl;

            return dto;
        }

        public static List<ProductDTO> CreateList(List<Product> productList)
        {
            var dtoList = new List<ProductDTO>();
            foreach (var p in productList)
            {
                dtoList.Add(Create(p));
            }
            return dtoList;
        }
    }
}