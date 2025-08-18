using AutoMapper;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.SearchAndFilter;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using Ultitity.Extensions;

namespace HomeCareDNAPI.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Enum to string mapping
            CreateMap<ServiceType, string>()
                .ConvertUsing(src => src.GetDisplayName());
            CreateMap<PackageOption, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<BuildingType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<MainStructureType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<DesignStyle, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<ApplicationStatus, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<Brand, string>().ConvertUsing(src => src.GetDisplayName());
            

            // ServiceRequest Create
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            //Service Create
            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // ContractorApplication Create
            CreateMap<ContractorApplicationCreateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // Material Create
            CreateMap<MaterialCreateRequestDto, Material>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            //Category Create
            CreateMap<CategoryCreateRequestDto, Category>().ReverseMap();

            //Category Update
            CreateMap<CategoryUpdateRequestDto, Category>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            
            // Complex mapping (Response)

            // ServiceRequest
            CreateMap<ServiceRequest, ServiceRequestDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );
            //Service
            CreateMap<Service, ServiceDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );
            // ContractorApplication
            CreateMap<ContractorApplication, ContractorApplicationDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );
            // Material
            CreateMap<Material, MaterialDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );
            //Category
            CreateMap<Category, CategoryDto>();


            //Filter
            CreateMap<Material, SearchResponseDto>()
             .ForMember(dest => dest.UserId,
                 opt => opt.MapFrom(src => src.UserID))
             .ForMember(dest => dest.UnitPrice,
                 opt => opt.MapFrom(src => src.UnitPrice))
             .ForMember(dest => dest.CategoryName,
                 opt => opt.MapFrom(src => src.Category.CategoryName))
             .ForMember(dest => dest.Description,
                 opt => opt.MapFrom(src => src.Description))
             .ForMember(dest => dest.ImageUrls,
                 opt => opt.MapFrom(src =>
                     src.Images != null ? src.Images.Select(i => i.ImageUrl).ToList() : new List<string>())
             );

        }
    }
}
