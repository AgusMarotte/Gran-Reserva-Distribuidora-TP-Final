
using Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Delivery
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DeliveryType Type { get; set; }
        public string Branch { get; set; }   
        public string Field { get; set; }    
        public int OrderId { get; set; }     
        public Order Order { get; set; }     

      
        public void ConfirmDelivery()
        {
            Console.WriteLine($"Entrega confirmada: {Type} en {Branch}");
        }
    }
}
