namespace BusinessLogic.DTOs.Authorize.User
{
    public class AddressDto
    {
        public string UserId { get; set; } = default!;
        public Guid AddressID { get; set; }
        public string City { get; set; } = default!;
        public string District { get; set; } = default!;
        public string Ward { get; set; } = default!;
        public string Detail { get; set; } = default!;
    }
}
