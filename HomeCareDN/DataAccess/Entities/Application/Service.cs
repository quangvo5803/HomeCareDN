using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Service
    {
        [Key]
        public Guid ServiceID { get; set; }

        [Required]
        public required string Name { get; set; }
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }
        public BuildingType BuildingType { get; set; }
        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public ICollection<Image>? Images { get; set; } = new List<Image>();
    }

    public enum ServiceType
    {
        [Display(Name = "Thi công xây dựng")]
        Construction, // Thi công xây dựng

        [Display(Name = "Cải tạo sửa chửa")]
        Repair, // Sửa chữa

        [Display(Name = "Mua vật liệu xây dựng")]
        MaterialOrder // Mua vật liệu xây dựng
        ,
    }

    public enum PackageOption
    {
        [Display(Name = "Trọn gói phần thô")]
        StructureOnly, // Trọn gói phần thô

        [Display(Name = "Trọn gói hoàn thiện cơ bản")]
        BasicFinish, // Trọn gói hoàn thiện cơ bản

        [Display(Name = "Khác")]
        Other // Gói khác / yêu cầu đặc biệt
        ,
    }

    public enum BuildingType
    {
        [Display(Name = "Nhà cấp 4")]
        Level4House,

        [Display(Name = "Nhà phố")]
        Townhouse,

        [Display(Name = "Nhà trọ")]
        RentalHouse,

        [Display(Name = "Căn hộ")]
        Apartment,

        [Display(Name = "Biệt thự")]
        Villa,

        [Display(Name = "Khách sạn")]
        Hotel,

        [Display(Name = "Showroom")]
        Showroom,

        [Display(Name = "Trường học")]
        School,

        [Display(Name = "Bệnh viện")]
        Hospital,

        [Display(Name = "Kho xưởng")]
        Warehouse,

        [Display(Name = "Khác")]
        Other,
    }

    public enum MainStructureType
    {
        [Display(Name = "Bê tông cốt thép")]
        ReinforcedConcrete,

        [Display(Name = "Nhà thép tiền chế")]
        PreEngineeredSteel,

        [Display(Name = "Gỗ tự nhiên")]
        NaturalWood,

        [Display(Name = "Nhà lắp ghép")]
        Prefabricated,

        [Display(Name = "Khác")]
        Other // Gói khác / yêu cầu đặc biệt
        ,
    }

    public enum DesignStyle
    {
        [Display(Name = "Hiện đại")]
        Modern,

        [Display(Name = "Đương đại")]
        Contemporary,

        [Display(Name = "Tối giản")]
        Minimalist,

        [Display(Name = "Cổ điển")]
        Classic,

        [Display(Name = "Tân cổ điển")]
        NeoClassic,

        [Display(Name = "Indochine")]
        Indochine,

        [Display(Name = "Mộc mạc")]
        Rustic,

        [Display(Name = "Khác")]
        Other,
    }
}
