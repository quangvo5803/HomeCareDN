using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Service
    {
        [Key]
        public Guid ServiceID { get; set; }

        [Required]
        public required string Name { get; set; }
        public string? NameEN { get; set; }
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }
        public BuildingType BuildingType { get; set; }
        public MainStructureType? MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Image>? Images { get; set; } = new List<Image>();
    }

    public enum ServiceType
    {
        [Display(Name = "Construction")]
        Construction,

        [Display(Name = "Repair")]
        Repair,

        [Display(Name = "MaterialOrder")]
        MaterialOrder,
    }

    public enum PackageOption
    {
        [Display(Name = "StructureOnly")]
        StructureOnly,

        [Display(Name = "BasicFinish")]
        BasicFinish,

        [Display(Name = "FullFinish")]
        FullFinish,

        [Display(Name = "Other")]
        Other,
    }

    public enum BuildingType
    {
        [Display(Name = "SingleStoryHouse")]
        SingleStoryHouse,

        [Display(Name = "Townhouse")]
        Townhouse,

        [Display(Name = "RentalHouse")]
        RentalHouse,

        [Display(Name = "Apartment")]
        Apartment,

        [Display(Name = "Villa")]
        Villa,

        [Display(Name = "Hotel")]
        Hotel,

        [Display(Name = "Showroom")]
        Showroom,

        [Display(Name = "School")]
        School,

        [Display(Name = "Hospital")]
        Hospital,

        [Display(Name = "Warehouse")]
        Warehouse,

        [Display(Name = "Other")]
        Other,
    }

    public enum MainStructureType
    {
        [Display(Name = "ReinforcedConcrete")]
        ReinforcedConcrete,

        [Display(Name = "PreEngineeredSteel")]
        PreEngineeredSteel,

        [Display(Name = "NaturalWood")]
        NaturalWood,

        [Display(Name = "Prefabricated")]
        Prefabricated,

        [Display(Name = "Other")]
        Other,
    }

    public enum DesignStyle
    {
        [Display(Name = "Modern")]
        Modern,

        [Display(Name = "Contemporary")]
        Contemporary,

        [Display(Name = "Minimalist")]
        Minimalist,

        [Display(Name = "Classic")]
        Classic,

        [Display(Name = "NeoClassic")]
        NeoClassic,

        [Display(Name = "Indochine")]
        Indochine,

        [Display(Name = "Rustic")]
        Rustic,

        [Display(Name = "Other")]
        Other,
    }
}
