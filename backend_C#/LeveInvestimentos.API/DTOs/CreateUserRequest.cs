using System.ComponentModel.DataAnnotations;

namespace LeveInvestimentos.API.DTOs
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MinLength(3, ErrorMessage = "O nome deve ter pelo menos 3 caracteres.")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public DateTime BirthDate { get; set; }

        public string? Landline { get; set; }

        [Required]
        [MinLength(9, ErrorMessage = "O telemóvel/celular deve ter pelo menos 9 dígitos.")]
        public string Mobile { get; set; } = string.Empty;

        [Required]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "A senha deve ter pelo menos 6 caracteres.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MinLength(5, ErrorMessage = "O endereço é obrigatório e deve ser válido.")]
        public string Address { get; set; } = string.Empty;

        public string? Photo { get; set; }

        public bool IsManager { get; set; } = false;
    }
}