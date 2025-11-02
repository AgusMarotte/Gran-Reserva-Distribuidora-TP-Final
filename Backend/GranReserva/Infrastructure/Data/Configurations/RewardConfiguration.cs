using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class RewardConfiguration : IEntityTypeConfiguration<Reward>
    {
        public void Configure(EntityTypeBuilder<Reward> builder)
        {
            builder.ToTable("Rewards");

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).ValueGeneratedOnAdd();

            builder.Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(r => r.Description)
                .HasMaxLength(500);

            builder.Property(r => r.ImageUrl)
                .IsRequired();

            builder.ToTable(tb => tb.HasCheckConstraint("CK_Reward_PointsRequired", "PointsRequired >= 0"));
            builder.ToTable(tb => tb.HasCheckConstraint("CK_Reward_Stock", "Stock >= 0"));
        }
    }
}