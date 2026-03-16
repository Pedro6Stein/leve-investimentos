using System.ComponentModel.DataAnnotations;

namespace LeveInvestimentos.API.DTOs
{
    public class CreateTaskRequest
    {
        [Required(ErrorMessage = "O ID do subordinado é obrigatório.")]
        public Guid AssigneeId { get; set; }

        [Required]
        [MinLength(5, ErrorMessage = "A descrição deve ter pelo menos 5 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DueDate { get; set; }
    }
}