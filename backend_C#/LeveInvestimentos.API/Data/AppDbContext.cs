using LeveInvestimentos.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace LeveInvestimentos.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Mapeamento das tabelas
        public DbSet<User> Users { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configura e-mail como únic
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configuração de Relacionamentos (Fluent API)
            // Evita o erro de múltiplos caminhos de cascata no SQL Server
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.Manager)
                .WithMany(u => u.ManagedTasks)
                .HasForeignKey(t => t.ManagerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.Assignee) // A tarefa tem um gerente.
                .WithMany(u => u.AssignedTasks) // O gerente pode ter muitas tarefas atribuídas a ele.
                .HasForeignKey(t => t.AssigneeId) // A chave estrangeira é AssigneeId na tabela TaskItem. (Nossa ligacao)
                .OnDelete(DeleteBehavior.NoAction);
        }

        


    }
}