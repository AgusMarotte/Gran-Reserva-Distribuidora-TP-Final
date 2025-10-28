using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.OrderDetailDTO

{
    public class OrderDetailDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Amount { get; set; }

        [Required]
        public float UnitaryPrice { get; set; }

        public float Total => Amount * UnitaryPrice;
    }
}


