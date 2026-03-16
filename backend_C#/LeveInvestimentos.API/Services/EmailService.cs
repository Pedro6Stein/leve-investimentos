using System.Net;
using System.Net.Mail;

namespace LeveInvestimentos.API.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private async Task SendEmailAsync(string to, string? cc, string subject, string body)
        {
            try
            {
                var emailUser = _configuration["EmailSettings:User"];
                var emailPass = _configuration["EmailSettings:Password"];

                if (string.IsNullOrEmpty(emailUser) || string.IsNullOrEmpty(emailPass))
                {
                    Console.WriteLine("Aviso: Credenciais de e-mail não configuradas no appsettings.");
                    return;
                }

                using var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(emailUser, emailPass),
                    EnableSsl = true,
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(emailUser, "LEVE Investimentos"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false,
                };

                mailMessage.To.Add(to);
                if (!string.IsNullOrEmpty(cc))
                {
                    mailMessage.CC.Add(cc);
                }

                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"📧 E-mail enviado com sucesso para: {to}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar e-mail: {ex.Message}");
            }
        }

        public async Task SendTaskAssignedEmailAsync(string to, string cc, string subordinateName, string description)
        {
            var subject = "LEVE - Nova Tarefa Atribuída";
            var body = $"Olá {subordinateName},\n\nUma nova tarefa foi atribuída a você:\n\n\"{description}\"\n\nAcesse o sistema para mais detalhes.";
            await SendEmailAsync(to, cc, subject, body);
        }

        public async Task SendTaskCompletedEmailAsync(string to, string managerName, string subordinateName, string description)
        {
            var subject = "LEVE - Tarefa Concluída";
            var body = $"Olá {managerName},\n\nO colaborador {subordinateName} concluiu a seguinte tarefa:\n\n\"{description}\"\n\nAcesse o sistema para validar.";
            await SendEmailAsync(to, null, subject, body);
        }

        public async Task SendTaskUpdatedEmailAsync(string to, string cc, string subordinateName, string description)
        {
            var subject = "LEVE - Tarefa Atualizada";
            var body = $"Olá {subordinateName},\n\nUma tarefa atribuída a você foi atualizada:\n\n\"{description}\"\n\nAcesse o sistema para mais detalhes.";
            await SendEmailAsync(to, cc, subject, body);
        }
    }
}