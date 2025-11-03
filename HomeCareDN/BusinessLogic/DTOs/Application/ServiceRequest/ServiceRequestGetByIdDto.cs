namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestGetByIdDto
    {
        public Guid ServiceRequestID { get; set; }
        public Guid? ContractorID { get; set; }
    }
}
