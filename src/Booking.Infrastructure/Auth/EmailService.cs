using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Booking.Application.Auth.Interfaces;

namespace Booking.Infrastructure.Auth;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetLink)
    {
        var apiKey = _configuration["Email:ApiKey"];
        var fromEmail = _configuration["Email:From"] ?? "noreply@booking.local";
        var fromName = _configuration["Email:FromName"] ?? "Booking System";

        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine($"[DEV] Password reset link for {email}: {resetLink}");
            return;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(email);
        var subject = "Reset Your Password";
        var plainTextContent = $"Click the link to reset your password: {resetLink}";
        var htmlContent = $@"
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            <a href='{resetLink}' style='background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;'>Reset Password</a>
            <p>Or copy this link: {resetLink}</p>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>";

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        await client.SendEmailAsync(msg);
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName)
    {
        var apiKey = _configuration["Email:ApiKey"];
        var fromEmail = _configuration["Email:From"] ?? "noreply@booking.local";
        var fromName = _configuration["Email:FromName"] ?? "Booking System";

        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine($"[DEV] Welcome email for {email} ({firstName})");
            return;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(email);
        var subject = "Welcome to Booking System!";
        var plainTextContent = $"Hi {firstName}, welcome to our booking platform!";
        var htmlContent = $@"
            <h2>Welcome, {firstName}!</h2>
            <p>Thank you for registering with our booking system.</p>
            <p>You can now book appointments, manage your schedule, and more.</p>
            <a href='https://yourapp.com/login' style='background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;'>Get Started</a>";

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        await client.SendEmailAsync(msg);
    }

    public string GetBaseUrl() => _configuration["PublicBaseUrl"] ?? "http://localhost:5173";

    public async Task SendInvitationEmailAsync(string email, string inviteLink, string businessName)
    {
        var apiKey = _configuration["Email:ApiKey"];
        var fromEmail = _configuration["Email:From"] ?? "noreply@booking.local";
        var fromName = _configuration["Email:FromName"] ?? "Booking System";

        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine($"[DEV] Invitation for {email} to join {businessName}: {inviteLink}");
            return;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(email);
        var subject = $"You've been invited to join {businessName} on Booked.";
        var plainTextContent = $"Join {businessName} on Booked. by accepting this invitation: {inviteLink}";
        var htmlContent = $@"
            <h2>You've been invited!</h2>
            <p>{businessName} has invited you to join their team on <strong>Booked.</strong></p>
            <a href='{inviteLink}' style='background-color: #B8862B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;'>Accept Invitation</a>
            <p>Or copy this link: {inviteLink}</p>
            <p>This invitation expires in 7 days.</p>";

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
        await client.SendEmailAsync(msg);
    }
}