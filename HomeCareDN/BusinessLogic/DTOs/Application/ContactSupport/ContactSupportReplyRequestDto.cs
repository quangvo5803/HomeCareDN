namespace BusinessLogic.DTOs.Application.ContactSupport
{
    public class ContactSupportReplyRequestDto
    {
        public Guid ID { get; set; }
        public string ReplyContent { get; set; } = default!;
    }
}
