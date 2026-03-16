using LeveInvestimentos.API.Data;
using LeveInvestimentos.API.DTOs;
using LeveInvestimentos.API.Entities;
using LeveInvestimentos.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LeveInvestimentos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public TasksController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
        {
            var managerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var managerEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            var task = new TaskItem
            {
                Description = request.Description,
                DueDate = request.DueDate,
                ManagerId = managerId,
                AssigneeId = request.AssigneeId,
                Status = 1
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var assignee = await _context.Users.FindAsync(request.AssigneeId);
            if (assignee != null && !string.IsNullOrEmpty(managerEmail))
            {
                _ = _emailService.SendTaskAssignedEmailAsync(assignee.Email, managerEmail, assignee.FullName, task.Description);
            }

            return StatusCode(201, task);
        }

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

        [HttpGet("managed")]
        [Authorize(Roles = "Manager")]
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

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var task = await _context.Tasks
                .Include(t => t.Manager)
                .Include(t => t.Assignee)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound(new { error = "Tarefa não encontrada." });

            task.Status = 2;
            task.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (task.Manager != null && task.Assignee != null)
            {
                _ = _emailService.SendTaskCompletedEmailAsync(task.Manager.Email, task.Manager.FullName, task.Assignee.FullName, task.Description);
            }

            return Ok(task);
        }

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

            var assignee = await _context.Users.FindAsync(task.AssigneeId);
            var managerEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            if (assignee != null && !string.IsNullOrEmpty(managerEmail))
            {
                _ = _emailService.SendTaskUpdatedEmailAsync(assignee.Email, managerEmail, assignee.FullName, task.Description);
            }

            return Ok(task);
        }
    }
}