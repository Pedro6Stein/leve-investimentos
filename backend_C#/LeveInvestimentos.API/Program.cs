using LeveInvestimentos.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using LeveInvestimentos.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ccadastrar o que a aplicaçao precisa
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Regista o AuthService para Injeção de Dependência
builder.Services.AddScoped<AuthService>();

// Configura a Autenticação via JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing");

builder.Services.AddAuthentication(options => // Configura os esquemas de autenticação
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Adiciona autorização
builder.Services.AddAuthorization();

builder.Services.AddCors(options => // Configura CORS para permitir requisições de qualquer origem (Meu frontendzinho)
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Área do Pipeline HTTP (Middlewares)
if (app.Environment.IsDevelopment()) // Somente em desenvolvimento, habilitamos o Swagger para documentação da API
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); //dispara os middlewares de autenticação e autorização antes dos controllers
app.UseCors("DefaultPolicy"); // Habilita CORS com a política definida

app.UseAuthentication(); // Verifica o token JWT e autentica o utilizador

app.UseAuthorization(); // Verifica as políticas de autorização (se necessário)

app.MapControllers();  // Mapeia os controllers para as rotas

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    SeedData.Initialize(context);
}

app.Run();