namespace Domain.Entities
{
    public class OrderDetail
    {
        public int Id { get; set; }
         public int Amount { get; set; }
        public decimal UnitaryPrice { get; set; }
        public decimal Total { get; set; }
    }
}

// TO-DO: Agregar relaciones con order y product y claves foraneas
