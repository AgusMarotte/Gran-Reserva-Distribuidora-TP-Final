using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts([FromQuery] bool includesoftdeleted = false)
        {
            var products = await _productService.GetAllProductsAsync(includesoftdeleted);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById([FromRoute] int id, [FromQuery] bool includesoftdeleted = false)
        {
            var product = await _productService.GetProductByIdAsync(id, includesoftdeleted);
            if (product == null)
            {
                return NotFound("Producto no encontrado.");
            }

            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreationProductDTO productdto)
        {
            if (productdto == null)
            {
                return BadRequest("El producto no puede ser nulo.");
            }

            var newProduct = await _productService.CreateProductAsync(productdto);

            return CreatedAtAction(nameof(GetProductById), new { id = newProduct.Id }, newProduct);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromBody] UpdateProductDTO productdto)
        {


            if (productdto == null)
            {
                return BadRequest("Datos del producto inválidos.");
            }

            var result = await _productService.UpdateProductAsync(id, productdto);

            if (!result)
            {
                return NotFound("Producto no encontrado.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct([FromRoute] int id, [FromQuery] bool permanently = false)
        {
            var result = await _productService.DeleteProductAsync(id, permanently);

            if (!result)
            {
                return NotFound("Producto no encontrado.");
            }

            return NoContent();
        }

        [HttpPatch("{id}/restore")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            var restoredProduct = await _productService.RestoreProductAsync(id);

            if (restoredProduct == null)
            {
                return NotFound("No se pudo restaurar el producto. Es posible que no exista o que ya esté activo.");
            }

            return Ok(restoredProduct);
        }
    }
}