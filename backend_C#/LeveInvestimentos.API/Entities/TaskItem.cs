using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeveInvestimentos.API.Entities
{
    [Table("Tasks")]
    public class TaskItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ManagerId { get; set; }

        [Required]
        public Guid AssigneeId { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime DueDate { get; set; }

        public int Status { get; set; } = 1; // 1 = Pendente, 2 = Concluída

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        // Chaves Estrangeiras
        [ForeignKey("ManagerId")]
        public User Manager { get; set; } = null!;

        [ForeignKey("AssigneeId")]
        public User Assignee { get; set; } = null!;
    }
}