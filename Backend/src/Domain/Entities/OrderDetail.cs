namespace Domain.Entities
{
    public class OrderDetail
    {
        public int Id { get; private set; }
        public int Amount { get; private set; }
        public float UnitaryPrice { get; private set; }
        public float Total { get; private set; }
        public int OrderId { get; private set; }
        public Order Order { get; private set; }
        public int ProductId { get; private set; }
        public Product Product { get; private set; }

        private OrderDetail() { }

        public OrderDetail(int orderId, int productId, int amount, float unitaryPrice)
        {
            if (amount <= 0)
                throw new ArgumentException("La cantidad debe ser mayor que cero.");
            if (unitaryPrice < 0)
                throw new ArgumentException("El precio unitario no puede ser negativo.");

            OrderId = orderId;
            ProductId = productId;
            Amount = amount;
            UnitaryPrice = unitaryPrice;
            Total = amount * unitaryPrice;
        }
    }
}
