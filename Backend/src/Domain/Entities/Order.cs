namespace Domain.Entities
{
    public class Order
    {
        public int Id { get; private set; }
        public DateTime Date { get; private set; } = DateTime.UtcNow;
        public float Total { get; private set; }
        public string State { get; private set; } = "Pending";
        public string? QrCode { get; private set; }

        public int ClientId { get; private set; }
        public Client Client { get; private set; } = null!;

        public ICollection<OrderDetail> OrderDetails { get; private set; } = new List<OrderDetail>();

        private Order() { } 

        public Order(int clientId)
        {
            if (clientId <= 0)
                throw new ArgumentException("El clientId es inválido.");

            ClientId = clientId;
            Total = 0;
        }

        public void AddOrderDetail(int productId, float price, int amount)
        {
            var detail = new OrderDetail(Id, productId, amount, price);
            OrderDetails.Add(detail);
            Total += detail.Total;
        }

        public void UpdateState(string newState)
        {
            if (string.IsNullOrWhiteSpace(newState))
                throw new ArgumentException("El estado no puede estar vacío.");

            State = newState;
        }

        public void GenerateQrCode(string qr)
        {
            if (string.IsNullOrWhiteSpace(qr))
                throw new ArgumentException("El código QR no puede ser vacío.");

            QrCode = qr;
        }
    }
}
