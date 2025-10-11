namespace Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public string State { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;

    }
}

// TO-DO: Agregar relaciones con Client, Delivery y OrderDetail y sus Claves Foráneas