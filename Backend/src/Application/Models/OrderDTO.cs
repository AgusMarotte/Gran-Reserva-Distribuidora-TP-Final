using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.OrderDTO
{
    public class OrderDTO
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        public float Total { get; set; }

        [Required]
        public string State { get; set; }


    }
}