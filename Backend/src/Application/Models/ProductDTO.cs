using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models
{
    public class ProductDTO
    {
        [Required]
        public string Name { get; private set; }
        [Required]
        public string Description { get; private set; }
        [Required]
        public float Price { get; private set; }
        [Required]
        public int Stock { get; private set; }
        public string ImageUrl { get; private set; }
    }
}
