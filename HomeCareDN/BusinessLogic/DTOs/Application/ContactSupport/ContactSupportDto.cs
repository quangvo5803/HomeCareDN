namespace BusinessLogic.DTOs.Application.ContactSupport
{
    public  class ContactSupportDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Subject { get; set; } = default!;
        public bool IsProcessed { get; set; }
    }
}
