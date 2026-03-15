using LeveInvestimentos.API.Entities;
using BCrypt.Net;

namespace LeveInvestimentos.API.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            // Se já houver utilizadores, não fazemos nada
            if (context.Users.Any()) return;

            var admin = new User
            {
                FullName = "Gestor TI Inicial",
                Email = "ti@leveinvestimentos.com.br",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teste123"),
                Address = "Sede LEVE",
                BirthDate = new DateTime(1990, 1, 1),
                Mobile = "11999999999",
                IsManager = true
            };

            context.Users.Add(admin);
            context.SaveChanges();
        }
    }
}