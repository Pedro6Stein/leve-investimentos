using LeveInvestimentos.API.DTOs;
using LeveInvestimentos.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace LeveInvestimentos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.AuthenticateAsync(request);

            if (result == null)
            {
                return Unauthorized(new { error = "Credenciais inválidas." });
            }

            // Retorna o objeto completo (user + token) formatado no AuthService
            return Ok(result);
        }
    }
}