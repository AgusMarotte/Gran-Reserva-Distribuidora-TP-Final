using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DeliveryDTO;

public class DeliveryDTO
{
     public DeliveryType Type { get; set; }
     public string Branch { get; set; } 
     public string Field { get; set; }    

}