using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application
{
    public class QueryParameters
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 12;

        // mở rộng
        public Guid? FilterID { get; set; }

        //filter 6 enum
        public ServiceType? FilterServiceType { get; set; }
        public PackageOption? FilterPackageOption { get; set; }
        public BuildingType? FilterBuildingType { get; set; }
        public MainStructureType? FilterMainStructureType { get; set; }
        public DesignStyle? FilterDesignStyle { get; set; }
        public PartneRequestrStatus? FilterPartnerRequestStatus { get; set; }

        public Guid? ExcludedID { get; set; }
        public string? FilterRoleName { get; set; }
        public Guid? FilterCategoryID { get; set; }
        public Guid? FilterBrandID { get; set; }
        public bool? FilterBool { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public int? Rating { get; set; }
        public bool SortDescending { get; set; } = false;
        public bool FinalSearch { get; set; } = false;
        public string? SearchType { get; set; }
    }
}
