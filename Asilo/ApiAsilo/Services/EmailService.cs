using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;

namespace ApiAsilo.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task EnviarCorreoAsync(
            string destinatario,
            string asunto,
            string mensaje)
        {
            var correo = _configuration["EmailSettings:Correo"];
            var contraseña = _configuration["EmailSettings:Contraseña"];
            var email = new MimeMessage();
            
            email.From.Add(new MailboxAddress("Asilo de Ancianos Cabeza de Algodón", correo));
            email.To.Add(new MailboxAddress("", destinatario));
            email.Subject = asunto;

            var builder = new BodyBuilder
            {
                HtmlBody = mensaje
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(correo, contraseña);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}