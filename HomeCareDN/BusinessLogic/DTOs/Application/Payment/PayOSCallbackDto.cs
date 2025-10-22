using DataAccess.Entities.Application;
namespace BusinessLogic.DTOs.Application.Payment
{
    public class PayOSCallbackDto
    {
        public string? Code { get; set; }
        public string? Desc { get; set; }
        public PayOSCallbackDataDto?  Data { get; set; }
        public string? Signature { get; set; }
    }
}
