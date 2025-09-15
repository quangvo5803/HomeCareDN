namespace BusinessLogic.DTOs.Authorize.AddressDtos
{
    public class AddressDto
    {
        public string UserId { get; set; } = default!;
        public Guid AddressId { get; set; }
        public string City { get; set; } = default!;
        public string District { get; set; } = default!;
        public string Ward { get; set; } = default!;
        public string Detail { get; set; } = default!;
    }
}
