namespace Ultitity.Email.Interface
{
    public interface IEmailQueue
    {
        void QueueEmail(string email, string subject, string htmlMessage);
        bool TryDequeue(out (string Email, string Subject, string HtmlMessage) emailData);
    }
}
