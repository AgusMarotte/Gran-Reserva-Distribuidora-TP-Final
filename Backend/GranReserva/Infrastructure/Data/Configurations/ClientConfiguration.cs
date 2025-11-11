using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class ClientConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            builder.Property(c => c.Points)
                .IsRequired()
                .HasDefaultValue(0);

            builder.ToTable(tb => tb.HasCheckConstraint("CK_Client_Points", "Points >= 0"));
        }
    }
}