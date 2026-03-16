using LeveInvestimentos.API.Data;
using LeveInvestimentos.API.DTOs;
using LeveInvestimentos.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LeveInvestimentos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Tranca o controller inteiro (exige token)
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        //  LISTAR TODOS (Somente Gestores)
        [HttpGet]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> ListAll()
        {
            var users = await _context.Users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Mobile = u.Mobile,
                    Landline = u.Landline,
                    Address = u.Address,
                    BirthDate = u.BirthDate,
                    IsManager = u.IsManager,
                    CreatedAt = u.CreatedAt,
                    Photo = u.Photo
                })
                .ToListAsync();

            return Ok(users);
        }

        // CADASTRAR USUÁRIO (Somente Gestores)
        [HttpPost]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            // Valida se o e-mail já existe (Erro P2002 do Prisma)
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
                return BadRequest(new { error = "Este e-mail já está cadastrado." });

            // Criptografa a senha com BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                FullName = request.FullName,
                BirthDate = request.BirthDate,
                Landline = request.Landline,
                Mobile = request.Mobile,
                Email = request.Email,
                PasswordHash = passwordHash,
                Address = request.Address,
                Photo = request.Photo,
                IsManager = request.IsManager
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                id = newUser.Id,
                email = newUser.Email,
                fullName = newUser.FullName,
                landline = newUser.Landline,
                mobile = newUser.Mobile,
                address = newUser.Address
            });
        }

        // MEU PERFIL (Qualquer usuário logado)
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            // Lê o ID de dentro do Token JWT (Claim "Sub")
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                return Unauthorized(new { error = "Token inválido ou ausente." });

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Mobile = u.Mobile,
                    Landline = u.Landline,
                    Address = u.Address,
                    BirthDate = u.BirthDate,
                    IsManager = u.IsManager,
                    CreatedAt = u.CreatedAt,
                    Photo = u.Photo
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound(new { error = "Usuário não encontrado." });

            return Ok(user);
        }
    }
}