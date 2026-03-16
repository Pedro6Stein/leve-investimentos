using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeveInvestimentos.API.Data;
using LeveInvestimentos.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LeveInvestimentos.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<object?> AuthenticateAsync(LoginRequest request)
        {
            // Busca o utilizador pelo e-mail
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return null;

            // Verifica se a senha confere com o Hash salvo no banco
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid) return null;

            // Define as permissões (Roles) com base na flag IsManager
            var role = user.IsManager ? "Manager" : "Employee";

            // Cria as "Reivindicações" (Claims) que vão dentro do token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, role) // Essencial para bloquear rotas depois
            };

            // 5. Assina o token com a chave secreta do appsettings.json
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8), // Token válido por 8 horas
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 6. Retorno idêntico ao esperado pelo frontend (Node.js)
            return new
            {
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    isManager = user.IsManager
                },
                token = tokenString
            };
        }
    }
}