namespace Domain.Entities
{
    public class Product
    {
        public int Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public float Price { get; private set; }
        public int Stock { get; private set; }
        public string ImageUrl { get; private set; }

        public ICollection<OrderDetail> OrderDetails { get; private set; } = new List<OrderDetail>();

        public Product() { }

        public Product(string name, string description, float price, int stock, string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("El nombre del producto no puede estar vacío.");
            if (price < 0)
                throw new ArgumentException("El precio no puede ser negativo.");
            if (stock < 0)
                throw new ArgumentException("El stock no puede ser negativo.");

            Name = name;
            Description = description;
            Price = price;
            Stock = stock;
            ImageUrl = imageUrl;
        }

        public int CheckStock() => Stock;
        public void UpdateStock(int quantity)
        {
            if (quantity < 0 && Math.Abs(quantity) > Stock)
                throw new InvalidOperationException("No hay suficiente stock.");
            if (Stock + quantity < 0)
                throw new InvalidOperationException("El stock no puede ser negativo.");

            Stock += quantity;
        }
         public void ReserveStock(int amount)
        {
            if (Stock < amount)
                throw new InvalidOperationException($"Stock insuficiente. Solo quedan {Stock} unidades.");
            Stock -= amount;
        }
    }
}

