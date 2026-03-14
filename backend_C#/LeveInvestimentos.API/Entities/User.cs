using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeveInvestimentos.API.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column(TypeName = "varchar(150)")]
        public string FullName { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime BirthDate { get; set; }

        [Column(TypeName = "varchar(20)")]
        public string? Landline { get; set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        public string Mobile { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(100)")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string Address { get; set; } = string.Empty;

        [Column(TypeName = "varchar(MAX)")]
        public string? Photo { get; set; }

        public bool IsManager { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Propriedades de Navegação (Relacionamentos)
        public ICollection<TaskItem> ManagedTasks { get; set; } = new List<TaskItem>();
        public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    }
}