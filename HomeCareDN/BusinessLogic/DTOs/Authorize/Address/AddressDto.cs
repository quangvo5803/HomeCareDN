namespace BusinessLogic.DTOs.Authorize.AddressDtos
{
    public class AddressDto
    {
        public Guid Id { get; set; }
        public string City { get; set; } = default!;
        public string District { get; set; } = default!;
        public string Ward { get; set; } = default!;
        public string Detail { get; set; } = default!;
    }
}
