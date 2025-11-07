using Domain.Entities;

namespace Application.Models
{
    public class RewardExchangeDTO
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public long PointsUsed { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int RewardId { get; set; }
        public string RewardName { get; set; } = string.Empty;
        public string QrCodeBase64 { get; set; } = string.Empty;

        public static RewardExchangeDTO? Create(RewardExchange exchange)
        {
            if (exchange == null) return null;

            return new RewardExchangeDTO
            {
                Id = exchange.Id,
                Date = exchange.Date,
                PointsUsed = exchange.PointsUsed,
                ClientId = exchange.ClientId,
                ClientName = exchange.Client != null ? $"{exchange.Client.Name} {exchange.Client.LastName}" : "Cliente no encontrado",
                RewardId = exchange.RewardId,
                RewardName = exchange.Reward?.Name ?? "Recompensa no encontrada"
            };
        }

        public static List<RewardExchangeDTO> CreateList(List<RewardExchange> exchangeList)
        {
            return exchangeList.Select(Create).OfType<RewardExchangeDTO>().ToList();
        }
    }
}