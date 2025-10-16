using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Repository
{
    public static class DatabaseSeeder
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
            // Profiles
            var studentProfileId = Guid.Parse("ff35132f-d761-40e6-9e05-f5ed30c0063d");
            var personalProfileId = Guid.Parse("ad07405b-cdf2-4780-8a0e-69323be32a6c");
            var nutritionistProfileId = Guid.Parse("eff474b5-ce49-42d5-84da-d9c904b721a1");

            modelBuilder.Entity<ProfileEntity>().HasData(
                new ProfileEntity
                {
                    Id = studentProfileId,
                    Name = "Estudante",
                    Status = "A"
                },
                new ProfileEntity
                {
                    Id = personalProfileId,
                    Name = "Personal",
                    Status = "A"
                },
                new ProfileEntity
                {
                    Id = nutritionistProfileId,
                    Name = "Nutricionista",
                    Status = "A"
                }
            );

            // Exercise Categories
            var cardioId = Guid.Parse("a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d");
            var strengthId = Guid.Parse("b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e");
            var flexibilityId = Guid.Parse("c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f");
            var functionalId = Guid.Parse("d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a");

            modelBuilder.Entity<ExerciseCategoryEntity>().HasData(
                new ExerciseCategoryEntity
                {
                    Id = cardioId,
                    Name = "Cardio",
                    Status = "A"
                },
                new ExerciseCategoryEntity
                {
                    Id = strengthId,
                    Name = "Força",
                    Status = "A"
                },
                new ExerciseCategoryEntity
                {
                    Id = flexibilityId,
                    Name = "Flexibilidade",
                    Status = "A"
                },
                new ExerciseCategoryEntity
                {
                    Id = functionalId,
                    Name = "Funcional",
                    Status = "A"
                }
            );

            // Muscle Groups
            var chestGroupId = Guid.Parse("e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b");
            var backGroupId = Guid.Parse("f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c");
            var shoulderGroupId = Guid.Parse("a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d");
            var legsGroupId = Guid.Parse("b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e");
            var armsGroupId = Guid.Parse("c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f");
            var coreGroupId = Guid.Parse("d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a");

            modelBuilder.Entity<MuscleGroupEntity>().HasData(
                new MuscleGroupEntity { Id = chestGroupId, Name = "Peito", Status = "A" },
                new MuscleGroupEntity { Id = backGroupId, Name = "Costas", Status = "A" },
                new MuscleGroupEntity { Id = shoulderGroupId, Name = "Ombros", Status = "A" },
                new MuscleGroupEntity { Id = legsGroupId, Name = "Pernas", Status = "A" },
                new MuscleGroupEntity { Id = armsGroupId, Name = "Braços", Status = "A" },
                new MuscleGroupEntity { Id = coreGroupId, Name = "Core", Status = "A" }
            );

            // Muscles - Peito
            var pectoralMajorId = Guid.Parse("e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b");
            var pectoralMinorId = Guid.Parse("f2a3b4c5-d6e7-5f6a-9b8c-0d1e2f3a4b5c");

            // Muscles - Costas
            var latsId = Guid.Parse("a3b4c5d6-e7f8-6a7b-0c9d-1e2f3a4b5c6d");
            var trapsId = Guid.Parse("b4c5d6e7-f8a9-7b8c-1d0e-2f3a4b5c6d7e");
            var rhomboidsId = Guid.Parse("c5d6e7f8-a9b0-8c9d-2e1f-3a4b5c6d7e8f");

            // Muscles - Ombros
            var anteriorDeltoidId = Guid.Parse("d6e7f8a9-b0c1-9d0e-3f2a-4b5c6d7e8f9a");
            var lateralDeltoidId = Guid.Parse("e7f8a9b0-c1d2-0e1f-4a3b-5c6d7e8f9a0b");
            var posteriorDeltoidId = Guid.Parse("f8a9b0c1-d2e3-1f2a-5b4c-6d7e8f9a0b1c");

            // Muscles - Pernas
            var quadricepsId = Guid.Parse("a9b0c1d2-e3f4-2a3b-6c5d-7e8f9a0b1c2d");
            var hamstringsId = Guid.Parse("b0c1d2e3-f4a5-3b4c-7d6e-8f9a0b1c2d3e");
            var glutesId = Guid.Parse("c1d2e3f4-a5b6-4c5d-8e7f-9a0b1c2d3e4f");
            var calvesId = Guid.Parse("d2e3f4a5-b6c7-5d6e-9f8a-0b1c2d3e4f5a");

            // Muscles - Braços
            var bicepsId = Guid.Parse("e3f4a5b6-c7d8-6e7f-0a9b-1c2d3e4f5a6b");
            var tricepsId = Guid.Parse("f4a5b6c7-d8e9-7f8a-1b0c-2d3e4f5a6b7c");
            var forearmsId = Guid.Parse("a5b6c7d8-e9f0-8a9b-2c1d-3e4f5a6b7c8d");

            // Muscles - Core
            var absId = Guid.Parse("b6c7d8e9-f0a1-9b0c-3d2e-4f5a6b7c8d9e");
            var obliquesId = Guid.Parse("c7d8e9f0-a1b2-0c1d-4e3f-5a6b7c8d9e0f");
            var lowerBackId = Guid.Parse("d8e9f0a1-b2c3-1d2e-5f4a-6b7c8d9e0f1a");

            modelBuilder.Entity<MuscleEntity>().HasData(
                // Peito
                new MuscleEntity { Id = pectoralMajorId, Name = "Peitoral Maior", MuscleGroupId = chestGroupId, Status = "A" },
                new MuscleEntity { Id = pectoralMinorId, Name = "Peitoral Menor", MuscleGroupId = chestGroupId, Status = "A" },
                
                // Costas
                new MuscleEntity { Id = latsId, Name = "Latíssimo do Dorso", MuscleGroupId = backGroupId, Status = "A" },
                new MuscleEntity { Id = trapsId, Name = "Trapézio", MuscleGroupId = backGroupId, Status = "A" },
                new MuscleEntity { Id = rhomboidsId, Name = "Romboides", MuscleGroupId = backGroupId, Status = "A" },
                
                // Ombros
                new MuscleEntity { Id = anteriorDeltoidId, Name = "Deltoide Anterior", MuscleGroupId = shoulderGroupId, Status = "A" },
                new MuscleEntity { Id = lateralDeltoidId, Name = "Deltoide Lateral", MuscleGroupId = shoulderGroupId, Status = "A" },
                new MuscleEntity { Id = posteriorDeltoidId, Name = "Deltoide Posterior", MuscleGroupId = shoulderGroupId, Status = "A" },
                
                // Pernas
                new MuscleEntity { Id = quadricepsId, Name = "Quadríceps", MuscleGroupId = legsGroupId, Status = "A" },
                new MuscleEntity { Id = hamstringsId, Name = "Isquiotibiais", MuscleGroupId = legsGroupId, Status = "A" },
                new MuscleEntity { Id = glutesId, Name = "Glúteos", MuscleGroupId = legsGroupId, Status = "A" },
                new MuscleEntity { Id = calvesId, Name = "Panturrilhas", MuscleGroupId = legsGroupId, Status = "A" },
                
                // Braços
                new MuscleEntity { Id = bicepsId, Name = "Bíceps", MuscleGroupId = armsGroupId, Status = "A" },
                new MuscleEntity { Id = tricepsId, Name = "Tríceps", MuscleGroupId = armsGroupId, Status = "A" },
                new MuscleEntity { Id = forearmsId, Name = "Antebraços", MuscleGroupId = armsGroupId, Status = "A" },
                
                // Core
                new MuscleEntity { Id = absId, Name = "Abdominais", MuscleGroupId = coreGroupId, Status = "A" },
                new MuscleEntity { Id = obliquesId, Name = "Oblíquos", MuscleGroupId = coreGroupId, Status = "A" },
                new MuscleEntity { Id = lowerBackId, Name = "Lombar", MuscleGroupId = coreGroupId, Status = "A" }
            );

            // Exercises
            var benchPressId = Guid.Parse("e9f0a1b2-c3d4-0d1e-6f5a-7b8c9d0e1f2a");
            var squatId = Guid.Parse("f0a1b2c3-d4e5-1e2f-7a6b-8c9d0e1f2a3b");
            var deadliftId = Guid.Parse("a1b2c3d4-e5f6-2f3a-8b7c-9d0e1f2a3b4c");
            var pullUpId = Guid.Parse("b2c3d4e5-f6a7-3a4b-9c8d-0e1f2a3b4c5d");
            var shoulderPressId = Guid.Parse("c3d4e5f6-a7b8-4b5c-0d9e-1f2a3b4c5d6e");
            var bicepCurlId = Guid.Parse("d4e5f6a7-b8c9-5c6d-1e0f-2a3b4c5d6e7f");
            var tricepDipsId = Guid.Parse("e5f6a7b8-c9d0-6d7e-2f1a-3b4c5d6e7f8a");
            var plankId = Guid.Parse("f6a7b8c9-d0e1-7e8f-3a2b-4c5d6e7f8a9b");
            var lungesId = Guid.Parse("a7b8c9d0-e1f2-8f9a-4b3c-5d6e7f8a9b0c");
            var lateralRaiseId = Guid.Parse("b8c9d0e1-f2a3-9a0b-5c4d-6e7f8a9b0c1d");

            modelBuilder.Entity<ExerciseEntity>().HasData(
                new ExerciseEntity
                {
                    Id = benchPressId,
                    Name = "Supino Reto",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=rT7DgCr-3pg",
                    Instruction = "Deite-se no banco, pegue a barra com as mãos na largura dos ombros, abaixe até o peito e empurre para cima.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = squatId,
                    Name = "Agachamento Livre",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=ultWZbUMPL8",
                    Instruction = "Com os pés na largura dos ombros, desça flexionando os joelhos até as coxas ficarem paralelas ao chão.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = deadliftId,
                    Name = "Levantamento Terra",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=ytGaGIn3SjE",
                    Instruction = "Com a barra no chão, segure-a e levante mantendo as costas retas até ficar em pé.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = pullUpId,
                    Name = "Barra Fixa",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=eGo4IYlbE5g",
                    Instruction = "Segure a barra com as mãos pronadas e puxe o corpo até o queixo passar a barra.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = shoulderPressId,
                    Name = "Desenvolvimento com Halteres",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=qEwKCR5JCog",
                    Instruction = "Sentado, empurre os halteres acima da cabeça até estender os braços completamente.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = bicepCurlId,
                    Name = "Rosca Direta",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
                    Instruction = "Em pé, segure a barra e flexione os cotovelos levando a barra até o peito.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = tricepDipsId,
                    Name = "Mergulho em Paralelas",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=2z8JmcrW-As",
                    Instruction = "Nas barras paralelas, desça flexionando os cotovelos e empurre para cima.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = plankId,
                    Name = "Prancha",
                    CategoryId = functionalId,
                    Url = "https://www.youtube.com/watch?v=ASdvN_XEl_c",
                    Instruction = "Apoie-se nos antebraços e pontas dos pés, mantendo o corpo reto por tempo determinado.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = lungesId,
                    Name = "Afundo",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
                    Instruction = "Dê um passo à frente e desça flexionando ambos os joelhos em 90 graus.",
                    Status = "A"
                },
                new ExerciseEntity
                {
                    Id = lateralRaiseId,
                    Name = "Elevação Lateral",
                    CategoryId = strengthId,
                    Url = "https://www.youtube.com/watch?v=3VcKaXpzqRo",
                    Instruction = "Em pé, levante os halteres lateralmente até a altura dos ombros.",
                    Status = "A"
                }
            );

            // Exercise Primary Muscles
            modelBuilder.Entity<ExercisePrimaryMuscleEntity>().HasData(
                // Supino Reto - Peitoral Maior
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), ExerciseId = benchPressId, MuscleId = pectoralMajorId, Status = "A" },
                
                // Agachamento - Quadríceps e Glúteos
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), ExerciseId = squatId, MuscleId = quadricepsId, Status = "A" },
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), ExerciseId = squatId, MuscleId = glutesId, Status = "A" },
                
                // Levantamento Terra - Lombar, Glúteos e Isquiotibiais
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), ExerciseId = deadliftId, MuscleId = lowerBackId, Status = "A" },
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), ExerciseId = deadliftId, MuscleId = glutesId, Status = "A" },
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), ExerciseId = deadliftId, MuscleId = hamstringsId, Status = "A" },
                
                // Barra Fixa - Latíssimo
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), ExerciseId = pullUpId, MuscleId = latsId, Status = "A" },
                
                // Desenvolvimento - Deltoide Anterior e Lateral
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), ExerciseId = shoulderPressId, MuscleId = anteriorDeltoidId, Status = "A" },
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), ExerciseId = shoulderPressId, MuscleId = lateralDeltoidId, Status = "A" },
                
                // Rosca Direta - Bíceps
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), ExerciseId = bicepCurlId, MuscleId = bicepsId, Status = "A" },
                
                // Mergulho - Tríceps
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), ExerciseId = tricepDipsId, MuscleId = tricepsId, Status = "A" },
                
                // Prancha - Abdominais
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), ExerciseId = plankId, MuscleId = absId, Status = "A" },
                
                // Afundo - Quadríceps e Glúteos
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), ExerciseId = lungesId, MuscleId = quadricepsId, Status = "A" },
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), ExerciseId = lungesId, MuscleId = glutesId, Status = "A" },
                
                // Elevação Lateral - Deltoide Lateral
                new ExercisePrimaryMuscleEntity { Id = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"), ExerciseId = lateralRaiseId, MuscleId = lateralDeltoidId, Status = "A" }
            );

            // Exercise Secondary Muscles
            modelBuilder.Entity<ExerciseSecondaryMuscleEntity>().HasData(
                // Supino Reto - Tríceps e Deltoide Anterior
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), ExerciseId = benchPressId, MuscleId = tricepsId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), ExerciseId = benchPressId, MuscleId = anteriorDeltoidId, Status = "A" },
                
                // Agachamento - Isquiotibiais e Lombar
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), ExerciseId = squatId, MuscleId = hamstringsId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), ExerciseId = squatId, MuscleId = lowerBackId, Status = "A" },
                
                // Levantamento Terra - Trapézio e Quadríceps
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), ExerciseId = deadliftId, MuscleId = trapsId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), ExerciseId = deadliftId, MuscleId = quadricepsId, Status = "A" },
                
                // Barra Fixa - Bíceps e Trapézio
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000007"), ExerciseId = pullUpId, MuscleId = bicepsId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000008"), ExerciseId = pullUpId, MuscleId = trapsId, Status = "A" },
                
                // Desenvolvimento - Tríceps
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000009"), ExerciseId = shoulderPressId, MuscleId = tricepsId, Status = "A" },
                
                // Rosca Direta - Antebraços
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000a"), ExerciseId = bicepCurlId, MuscleId = forearmsId, Status = "A" },
                
                // Mergulho - Peitoral Maior e Deltoide Anterior
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000b"), ExerciseId = tricepDipsId, MuscleId = pectoralMajorId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000c"), ExerciseId = tricepDipsId, MuscleId = anteriorDeltoidId, Status = "A" },
                
                // Prancha - Lombar e Oblíquos
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000d"), ExerciseId = plankId, MuscleId = lowerBackId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000e"), ExerciseId = plankId, MuscleId = obliquesId, Status = "A" },
                
                // Afundo - Isquiotibiais e Panturrilhas
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-00000000000f"), ExerciseId = lungesId, MuscleId = hamstringsId, Status = "A" },
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000010"), ExerciseId = lungesId, MuscleId = calvesId, Status = "A" },
                
                // Elevação Lateral - Trapézio
                new ExerciseSecondaryMuscleEntity { Id = Guid.Parse("10000000-0000-0000-0000-000000000011"), ExerciseId = lateralRaiseId, MuscleId = trapsId, Status = "A" }
            );
        }
    }
}
