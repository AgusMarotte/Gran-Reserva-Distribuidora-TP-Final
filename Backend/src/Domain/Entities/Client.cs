using Domain.Enums;

namespace Domain.Entities
{
    public class Client : User
    {
        public int Points { get; private set; }

        public ICollection<Order> Orders { get; private set; } = new List<Order>();
        public ICollection<Exchange> Exchanges { get; private set; } = new List<Exchange>();

        public Client() : base() { }

        public Client(string clientName, string lastName, string email, string password)
            : base(clientName, lastName, email, password, UserRole.Client)
        {
            Points = 0;
        }

        public void AddPoints(int points)
        {
            if (points < 0)
                throw new ArgumentException("Los puntos a sumar no pueden ser negativos.");

            Points += points;
        }

        public void RedeemPoints(int points)
        {
            if (points < 0)
                throw new ArgumentException("Los puntos a canjear no pueden ser negativos.");
            if (points > Points)
                throw new InvalidOperationException("No tienes puntos suficientes para canjear.");

            Points -= points;
        }
    }
}
