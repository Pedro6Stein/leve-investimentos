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
            var token = await _authService.AuthenticateAsync(request);

            if (token == null)
            {
                return Unauthorized(new { message = "E-mail ou senha incorretos." });
            }

            return Ok(new { token });
        }
    }
}