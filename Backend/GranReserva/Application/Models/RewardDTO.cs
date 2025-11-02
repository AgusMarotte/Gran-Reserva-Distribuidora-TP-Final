using Domain.Entities;

namespace Application.Models
{
    public class RewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int PointsRequired { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; }

        public static RewardDTO Create(Reward reward)
        {
            if (reward == null)
            {
                return null;
            }

            var dto = new RewardDTO();
            dto.Id = reward.Id;
            dto.Name = reward.Name;
            dto.Description = reward.Description;
            dto.PointsRequired = reward.PointsRequired;
            dto.Stock = reward.Stock;
            dto.ImageUrl = reward.ImageUrl;

            return dto;
        }

        public static List<RewardDTO> CreateList(List<Reward> rewardList)
        {
            var dtoList = new List<RewardDTO>();
            foreach(var r in rewardList)
            {
                dtoList.Add(Create(r));
            }
            return dtoList;
        }
    }
}