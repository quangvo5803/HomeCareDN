namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestGetByIdDto
    {
        public Guid MaterialRequestID { get; set; }
        public Guid? DistributorID { get; set; }
    }
}
