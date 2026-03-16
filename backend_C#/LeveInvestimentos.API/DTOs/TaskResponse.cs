namespace LeveInvestimentos.API.DTOs
{
    public class TaskResponse
    {
        public Guid Id { get; set; }
        public Guid ManagerId { get; set; }
        public Guid AssigneeId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Dados aninhados para o Frontend mostrar os nomes
        public UserSummary? Manager { get; set; }
        public UserSummary? Assignee { get; set; }
    }

    public class UserSummary
    {
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
    }
}