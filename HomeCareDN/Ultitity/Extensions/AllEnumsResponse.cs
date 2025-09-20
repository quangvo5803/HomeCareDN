namespace Ultitity.Extensions
{
    public class AllEnumsResponse
    {
        public List<EnumDto> ServiceTypes { get; set; } = new();
        public List<EnumDto> PackageOptions { get; set; } = new();
        public List<EnumDto> BuildingTypes { get; set; } = new();
        public List<EnumDto> MainStructures { get; set; } = new();
        public List<EnumDto> DesignStyles { get; set; } = new();
    }
}
