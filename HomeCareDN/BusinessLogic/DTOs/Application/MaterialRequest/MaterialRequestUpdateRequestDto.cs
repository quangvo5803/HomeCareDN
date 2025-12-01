namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestUpdateRequestDto
    {
        public Guid MaterialRequestID { get; set; }
        public Guid? AddressID { get; set; }
        public string? Description { get; set; }
        public bool CanAddMaterial { get; set; }
        public bool IsSubmit { get; set; }
        public DateTime DeliveryDate { get; set; }

        public List<MaterialRequestItemCreateDto>? AddItems { get; set; }
        public List<MaterialRequestItemUpdateDto>? UpdateItems { get; set; }
        public List<Guid>? DeleteItemIDs { get; set; }
    }

    public class MaterialRequestItemCreateDto
    {
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; }
    }

    public class MaterialRequestItemUpdateDto
    {
        public Guid MaterialRequestItemID { get; set; }
        public int Quantity { get; set; }
    }
}
