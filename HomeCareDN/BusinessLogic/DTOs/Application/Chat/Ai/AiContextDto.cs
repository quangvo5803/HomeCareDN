namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiContextDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public string BuildingType { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? Width { get; set; } = null;
        public double? Length { get; set; } = null;
        public int? Floors { get; set; } = null;
        public string Description { get; set; } = string.Empty;
        public string ServiceRequestID { get; set; } = string.Empty;
    }
}
