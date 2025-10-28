﻿using Microsoft.EntityFrameworkCore;
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
        public DbSet<PushSubscriptionEntity> PushSubscriptions { get; set; } = null!;
        public DbSet<ExerciseCategoryEntity> ExerciseCategories => Set<ExerciseCategoryEntity>();
        public DbSet<MuscleGroupEntity> MuscleGroups => Set<MuscleGroupEntity>();
        public DbSet<MuscleEntity> Muscles => Set<MuscleEntity>();
        public DbSet<ExerciseEntity> Exercises => Set<ExerciseEntity>();
        public DbSet<ExercisePrimaryMuscleEntity> ExercisePrimaryMuscles => Set<ExercisePrimaryMuscleEntity>();
        public DbSet<ExerciseSecondaryMuscleEntity> ExerciseSecondaryMuscles => Set<ExerciseSecondaryMuscleEntity>();
        public DbSet<RoutineEntity> Routines => Set<RoutineEntity>();
        public DbSet<CustomerRoutineEntity> CustomerRoutines => Set<CustomerRoutineEntity>();
        public DbSet<WorkoutEntity> Workouts => Set<WorkoutEntity>();
        public DbSet<WorkoutFeedbackEntity> WorkoutFeedbacks => Set<WorkoutFeedbackEntity>();
        public DbSet<WorkoutSetEntity> WorkoutSets => Set<WorkoutSetEntity>();
        public DbSet<WorkoutExerciseEntity> WorkoutExercises => Set<WorkoutExerciseEntity>();

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

            b.Entity<PushSubscriptionEntity>(e =>
            {
                e.ToTable("push_subscriptions");

                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.HasOne<UserEntity>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.Property(x => x.Endpoint)
                    .IsRequired()
                    .HasMaxLength(500);

                e.Property(x => x.P256dh)
                    .IsRequired()
                    .HasMaxLength(255);

                e.Property(x => x.Auth)
                    .IsRequired()
                    .HasMaxLength(255);

                e.Property(x => x.UserAgent)
                    .HasMaxLength(512);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.Property(x => x.ExpirationTime)
                    .HasColumnType("timestamp with time zone");

                e.Property(x => x.IsActive)
                    .HasDefaultValue(true);

                e.HasIndex(x => x.UserId);
                e.HasIndex(x => new { x.UserId, x.IsActive });
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

                e.HasMany(x => x.Appointments)
                    .WithOne(a => a.CustomerProfessionalBond)
                    .HasForeignKey(a => a.CustomerProfessionalBondId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<AppointmentEntity>(e =>
            {
                e.ToTable("Appointments");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");
            });

            b.Entity<CustomerFeedbackEntity>(e =>
            {
                e.ToTable("CustomerFeedbacks");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Professional)
                    .WithMany()
                    .HasForeignKey(x => x.ProfessionalId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(x => x.Customer)
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ProfessionalFeedbackEntity>(e =>
            {
                e.ToTable("ProfessionalFeedbacks");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Professional)
                    .WithMany()
                    .HasForeignKey(x => x.ProfessionalId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(x => x.Customer)
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
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

            b.Entity<ExerciseCategoryEntity>(e =>
            {
                e.ToTable("ExerciseCategories");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Name).IsRequired().HasMaxLength(100);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasMany(x => x.Exercises)
                    .WithOne(x => x.Category)
                    .HasForeignKey(x => x.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<MuscleGroupEntity>(e =>
            {
                e.ToTable("MuscleGroups");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Name).IsRequired().HasMaxLength(100);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasMany(x => x.Muscles)
                    .WithOne(x => x.MuscleGroup)
                    .HasForeignKey(x => x.MuscleGroupId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<MuscleEntity>(e =>
            {
                e.ToTable("Muscles");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Name).IsRequired().HasMaxLength(100);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.MuscleGroup)
                    .WithMany(x => x.Muscles)
                    .HasForeignKey(x => x.MuscleGroupId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ExerciseEntity>(e =>
            {
                e.ToTable("Exercises");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Name).IsRequired().HasMaxLength(200);
                e.Property(x => x.Url).HasMaxLength(500);
                e.Property(x => x.Instruction).HasMaxLength(2000);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Category)
                    .WithMany(x => x.Exercises)
                    .HasForeignKey(x => x.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<ExercisePrimaryMuscleEntity>(e =>
            {
                e.ToTable("ExercisePrimaryMuscles");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Muscle)
                    .WithMany(x => x.PrimaryMuscleExercises)
                    .HasForeignKey(x => x.MuscleId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Exercise)
                    .WithMany(x => x.PrimaryMuscles)
                    .HasForeignKey(x => x.ExerciseId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.ExerciseId, x.MuscleId }).IsUnique();
            });

            b.Entity<ExerciseSecondaryMuscleEntity>(e =>
            {
                e.ToTable("ExerciseSecondaryMuscles");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Muscle)
                    .WithMany(x => x.SecondaryMuscleExercises)
                    .HasForeignKey(x => x.MuscleId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Exercise)
                    .WithMany(x => x.SecondaryMuscles)
                    .HasForeignKey(x => x.ExerciseId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.ExerciseId, x.MuscleId }).IsUnique();
            });

            b.Entity<RoutineEntity>(e =>
            {
                e.ToTable("Routines");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Title).IsRequired().HasMaxLength(200);
                e.Property(x => x.Goal).HasMaxLength(500);
                e.Property(x => x.Difficulty).HasMaxLength(50);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Personal)
                    .WithMany()
                    .HasForeignKey(x => x.PersonalId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasMany(x => x.Workouts)
                    .WithOne(x => x.Routine)
                    .HasForeignKey(x => x.RoutineId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasMany(x => x.CustomerRoutines)
                    .WithOne(x => x.Routine)
                    .HasForeignKey(x => x.RoutineId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<CustomerRoutineEntity>(e =>
            {
                e.ToTable("CustomerRoutines");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Routine)
                    .WithMany(x => x.CustomerRoutines)
                    .HasForeignKey(x => x.RoutineId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Customer)
                    .WithMany()
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.RoutineId, x.CustomerId });
            });

            b.Entity<WorkoutEntity>(e =>
            {
                e.ToTable("Workouts");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Title).IsRequired().HasMaxLength(200);
                e.Property(x => x.Description).HasMaxLength(1000);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Routine)
                    .WithMany(x => x.Workouts)
                    .HasForeignKey(x => x.RoutineId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.WorkoutFeedback)
                    .WithOne(x => x.Workout)
                    .HasForeignKey<WorkoutEntity>(x => x.WorkoutFeedbackId)
                    .OnDelete(DeleteBehavior.SetNull);

                e.HasMany(x => x.WorkoutSets)
                    .WithOne(x => x.Workout)
                    .HasForeignKey(x => x.WorkoutId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<WorkoutFeedbackEntity>(e =>
            {
                e.ToTable("WorkoutFeedbacks");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Description).HasMaxLength(1000);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");
            });

            b.Entity<WorkoutSetEntity>(e =>
            {
                e.ToTable("WorkoutSets");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Field).HasMaxLength(200);
                e.Property(x => x.Description).HasMaxLength(500);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.Workout)
                    .WithMany(x => x.WorkoutSets)
                    .HasForeignKey(x => x.WorkoutId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Exercise)
                    .WithMany()
                    .HasForeignKey(x => x.ExerciseId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasMany(x => x.WorkoutExercises)
                    .WithOne(x => x.WorkoutSet)
                    .HasForeignKey(x => x.WorkoutSetId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.WorkoutId, x.Order });
            });

            b.Entity<WorkoutExerciseEntity>(e =>
            {
                e.ToTable("WorkoutExercises");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedOnAdd();

                e.Property(x => x.Load).HasPrecision(10, 2);

                e.Property(x => x.CreatedAt)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("timezone('utc', now())");

                e.HasOne(x => x.WorkoutSet)
                    .WithMany(x => x.WorkoutExercises)
                    .HasForeignKey(x => x.WorkoutSetId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            DatabaseSeeder.Seed(b);
        }
    }
}
