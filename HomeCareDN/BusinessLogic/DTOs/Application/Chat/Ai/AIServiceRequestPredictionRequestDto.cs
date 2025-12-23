using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AIServiceRequestPredictionRequestDto
    {
        public ServiceType ServiceType { get; set; }

        public PackageOption PackageOption { get; set; }

        public BuildingType BuildingType { get; set; }

        public MainStructureType MainStructureType { get; set; }

        public DesignStyle? DesignStyle { get; set; }

        public double Width { get; set; }

        public double Length { get; set; }

        public int Floors { get; set; }

        public string? Description { get; set; }
        public string? Language { get; set; } = "vi";
    }
}
