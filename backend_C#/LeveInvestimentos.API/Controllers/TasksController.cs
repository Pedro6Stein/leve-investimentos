using LeveInvestimentos.API.Data;
using LeveInvestimentos.API.DTOs;
using LeveInvestimentos.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LeveInvestimentos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Protege todas as rotas de tarefas
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // CRIAR TAREFA (Apenas Gestores)
        [HttpPost]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
        {
            var managerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var task = new TaskItem
            {
                Description = request.Description,
                DueDate = request.DueDate,
                ManagerId = managerId,
                AssigneeId = request.AssigneeId,
                Status = 1 // 1 = Pendente
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return StatusCode(201, task);
        }

        // LISTAR MINHAS TAREFAS 
        [HttpGet("my")]
        public async Task<IActionResult> ListMyTasks()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tasks = await _context.Tasks
                .Where(t => t.AssigneeId == userId)
                .OrderBy(t => t.DueDate)
                .Select(t => new TaskResponse
                {
                    Id = t.Id,
                    ManagerId = t.ManagerId,
                    AssigneeId = t.AssigneeId,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt,
                    Manager = new UserSummary { FullName = t.Manager.FullName }
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // LISTAR TAREFAS
        [HttpGet("managed")]
        [Authorize(Roles = "Manager")] // Somente gestores podem acessar esta rota
        public async Task<IActionResult> ListManagedTasks()
        {
            var managerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tasks = await _context.Tasks
                .Where(t => t.ManagerId == managerId)
                .OrderBy(t => t.DueDate)
                .Select(t => new TaskResponse
                {
                    Id = t.Id,
                    ManagerId = t.ManagerId,
                    AssigneeId = t.AssigneeId,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt,
                    Assignee = new UserSummary { FullName = t.Assignee.FullName, Email = t.Assignee.Email }
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // ONCLUIR TAREFA
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { error = "Tarefa não encontrada." });

            task.Status = 2; // 2 = Concluída
            task.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // TODO: Adicionar lógica de envio de E-mail para o Gestor

            return Ok(task);
        }

        // ATUALIZAR TAREFA (Apenas Gestores)
        [HttpPut("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateTaskRequest request)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { error = "Tarefa não encontrada." });

            task.Description = request.Description;
            task.DueDate = request.DueDate;
            task.AssigneeId = request.AssigneeId;

            await _context.SaveChangesAsync();

            return Ok(task);
        }
    }
}