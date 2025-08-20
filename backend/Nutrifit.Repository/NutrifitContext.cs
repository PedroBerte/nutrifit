using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository.Entities;

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
        public DbSet<Role> Role => Set<Role>();
        public DbSet<UserProfile> UserProfile => Set<UserProfile>();
        public DbSet<ProfileRole> ProfileRole => Set<ProfileRole>();

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
            });

            b.Entity<User>(e =>
            {
                e.ToTable("User");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<Address>()
                 .WithMany()
                 .HasForeignKey("AddressId")
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne<Profile>()
                 .WithMany()
                 .HasForeignKey("ProfileId")
                 .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<CustomerProfessionalBond>(e =>
            {
                e.ToTable("CustomerProfessionalBond");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<User>().WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey("SenderId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<Appointment>(e =>
            {
                e.ToTable("Appointment");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<CustomerProfessionalBond>()
                 .WithMany()
                 .HasForeignKey("CustomerProfessionalBondId")
                 .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerFeedback>(e =>
            {
                e.ToTable("CustomerFeedback");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<User>().WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalFeedback>(e =>
            {
                e.ToTable("ProfessionalFeedback");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<User>().WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalCredential>(e =>
            {
                e.ToTable("ProfessionalCredential");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<User>().WithMany().HasForeignKey("ProfessionalId").OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<Profile>(e =>
            {
                e.ToTable("Profile");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();
            });

            b.Entity<Role>(e =>
            {
                e.ToTable("Role");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();
            });

            b.Entity<UserProfile>(e =>
            {
                e.ToTable("UserProfile");
                e.HasKey(x => new { x.UserId, x.ProfileId });

                e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne<Profile>().WithMany().HasForeignKey(x => x.ProfileId).OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<ProfileRole>(e =>
            {
                e.ToTable("ProfileRole");
                e.HasKey(x => new { x.RoleId, x.ProfileId });

                e.HasOne<Role>().WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne<Profile>().WithMany().HasForeignKey(x => x.ProfileId).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
