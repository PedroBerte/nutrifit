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
            var studentProfileId = Guid.Parse("ff35132f-d761-40e6-9e05-f5ed30c0063d");
            var personalProfileId = Guid.Parse("ad07405b-cdf2-4780-8a0e-69323be32a6c");
            var nutritionistProfileId = Guid.Parse("eff474b5-ce49-42d5-84da-d9c904b721a1");

            modelBuilder.Entity<Profile>().HasData(
                new Profile
                {
                    Id = studentProfileId,
                    Name = "Estudante",
                    Status = "A"
                },
                new Profile
                {
                    Id = personalProfileId,
                    Name = "Personal",
                    Status = "A"
                },
                new Profile
                {
                    Id = nutritionistProfileId,
                    Name = "Nutricionista",
                    Status = "A"
                }
            );
        }
    }
}
