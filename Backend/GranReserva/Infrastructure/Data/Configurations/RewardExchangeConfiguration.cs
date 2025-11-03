using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class RewardExchangeConfiguration : IEntityTypeConfiguration<RewardExchange>
    {
        public void Configure(EntityTypeBuilder<RewardExchange> builder)
        {
            builder.ToTable("RewardExchanges");

            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.PointsUsed)
                .IsRequired();
            
            builder.Property(e => e.Date)
                .IsRequired();
            
            builder.HasOne(e => e.Client)
                .WithMany(c => c.RewardExchanges)
                .HasForeignKey(e => e.ClientId);

            builder.HasOne(e => e.Reward)
                .WithMany(r => r.RewardExchanges)
                .HasForeignKey(e => e.RewardId);
        }
    }
}