
namespace Domain.Entities
{
    public enum DeliveryType
    {
        Home,       
        Branch,    
        Express     
    }

    public class Delivery
    {
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
