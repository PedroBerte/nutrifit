using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository.Entities;
using Nutrifit.Repository.Utils;
using System.Reflection.Emit;

namespace Nutrifit.Repository
{
    public class NutrifitContext : DbContext
    {
        public NutrifitContext(DbContextOptions<NutrifitContext> options) : base(options) { }

        public DbSet<AddressEntity> Addresses => Set<AddressEntity>();
        public DbSet<UserEntity> Users => Set<UserEntity>();
        public DbSet<CustomerProfessionalBondEntity> CustomerProfessionalBonds => Set<CustomerProfessionalBondEntity>();
        public DbSet<AppointmentEntity> Appointments => Set<AppointmentEntity>();
        public DbSet<CustomerFeedbackEntity> CustomerFeedbacks => Set<CustomerFeedbackEntity>();
        public DbSet<ProfessionalFeedbackEntity> ProfessionalFeedbacks => Set<ProfessionalFeedbackEntity>();
        public DbSet<ProfessionalCredentialEntity> ProfessionalCredentials => Set<ProfessionalCredentialEntity>();
        public DbSet<ProfileEntity> Profiles => Set<ProfileEntity>();

        protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        {
            builder.Properties<DateTime>()
                .HaveColumnType("timestamp without time zone")
                .HaveConversion<UnspecifiedDateTimeConverter>();

            builder.Properties<DateTime?>()
                .HaveColumnType("timestamp without time zone")
                .HaveConversion<NullableUnspecifiedDateTimeConverter>();
        }

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.HasPostgresExtension("uuid-ossp"); 
            b.HasDefaultSchema(null);            

            b.Entity<AddressEntity>(e =>
            {
                e.ToTable("Addresses");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");
            });

            b.Entity<UserEntity>(e =>
            {
                e.ToTable("Users");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne(u => u.Profile)
                    .WithMany()
                    .HasForeignKey(u => u.ProfileId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(u => u.Address)   
                    .WithMany()
                    .HasForeignKey(u => u.AddressId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasIndex(u => u.Email).IsUnique();

                e.HasMany(u => u.CustomerProfessionalBonds)
                    .WithOne(bond => bond.Customer)
                    .HasForeignKey(bond => bond.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasMany(u => u.CustomerFeedbacks)
                    .WithOne(feedback => feedback.Customer)
                    .HasForeignKey(feedback => feedback.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(u => u.ProfessionalCredential)
                    .WithOne(credential => credential.Professional)
                    .HasForeignKey<ProfessionalCredentialEntity>(credential => credential.ProfessionalId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerProfessionalBondEntity>(e =>
            {
                e.ToTable("CustomerProfessionalBonds");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<UserEntity>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<UserEntity>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<UserEntity>(x => x.Sender).WithMany().HasForeignKey("SenderId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<AppointmentEntity>(e =>
            {
                e.ToTable("Appointments");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<CustomerProfessionalBondEntity>(x => x.CustomerProfessionalBond)
                 .WithMany()
                 .HasForeignKey("CustomerProfessionalBondId")
                 .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerFeedbackEntity>(e =>
            {
                e.ToTable("CustomerFeedbacks");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<UserEntity>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<UserEntity>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalFeedbackEntity>(e =>
            {
                e.ToTable("ProfessionalFeedbacks");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<UserEntity>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<UserEntity>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalCredentialEntity>(e =>
            {
                e.ToTable("ProfessionalCredentials");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(pc => pc.Professional)
                    .WithOne(u => u.ProfessionalCredential)
                    .HasForeignKey<ProfessionalCredentialEntity>(pc => pc.ProfessionalId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(pc => pc.ProfessionalId).IsUnique();
            });

            b.Entity<ProfileEntity>(e =>
            {
                e.ToTable("Profiles");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");
            });

            DatabaseSeeder.Seed(b);
        }
    }
}
