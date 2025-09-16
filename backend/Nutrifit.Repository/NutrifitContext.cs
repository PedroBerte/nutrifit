using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository.Entities;
using System.Reflection.Emit;

namespace Nutrifit.Repository
{
    public class NutrifitContext : DbContext
    {
        public NutrifitContext(DbContextOptions<NutrifitContext> options) : base(options) { }

        public DbSet<Address> Address => Set<Address>();
        public DbSet<User> User => Set<User>();
        public DbSet<CustomerProfessionalBond> CustomerProfessionalBond => Set<CustomerProfessionalBond>();
        public DbSet<Appointment> Appointment => Set<Appointment>();
        public DbSet<CustomerFeedback> CustomerFeedback => Set<CustomerFeedback>();
        public DbSet<ProfessionalFeedback> ProfessionalFeedback => Set<ProfessionalFeedback>();
        public DbSet<ProfessionalCredential> ProfessionalCredential => Set<ProfessionalCredential>();
        public DbSet<Profile> Profile => Set<Profile>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.HasPostgresExtension("uuid-ossp"); 
            b.HasDefaultSchema(null);            

            b.Entity<Address>(e =>
            {
                e.ToTable("Address");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");
            });

            b.Entity<User>(e =>
            {
                e.ToTable("User");
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

                e.HasMany(u => u.CustomerFeedback)
                    .WithOne(feedback => feedback.Customer)
                    .HasForeignKey(feedback => feedback.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(u => u.ProfessionalCredential)
                    .WithOne(credential => credential.Professional)
                    .HasForeignKey<ProfessionalCredential>(credential => credential.ProfessionalId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerProfessionalBond>(e =>
            {
                e.ToTable("CustomerProfessionalBond");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<User>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>(x => x.Sender).WithMany().HasForeignKey("SenderId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<Appointment>(e =>
            {
                e.ToTable("Appointment");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<CustomerProfessionalBond>(x => x.CustomerProfessionalBond)
                 .WithMany()
                 .HasForeignKey("CustomerProfessionalBondId")
                 .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerFeedback>(e =>
            {
                e.ToTable("CustomerFeedback");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<User>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalFeedback>(e =>
            {
                e.ToTable("ProfessionalFeedback");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne<User>(x => x.Professional).WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>(x => x.Customer).WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalCredential>(e =>
            {
                e.ToTable("ProfessionalCredential");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(pc => pc.Professional)
                    .WithOne(u => u.ProfessionalCredential)
                    .HasForeignKey<ProfessionalCredential>(pc => pc.ProfessionalId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(pc => pc.ProfessionalId).IsUnique();
            });

            b.Entity<Profile>(e =>
            {
                e.ToTable("Profile");
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
