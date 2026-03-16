namespace LeveInvestimentos.API.DTOs
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string? Landline { get; set; }
        public string Address { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public bool IsManager { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Photo { get; set; }
    }
}