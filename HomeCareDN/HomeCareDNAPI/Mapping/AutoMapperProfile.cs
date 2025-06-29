using AutoMapper;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Material;
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

            // ServiceRequest Create
            CreateMap<ServiceRequest, ServiceRequestCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            // ServiceRequest Update
            CreateMap<ServiceRequest, ServiceRequestUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            //Service Create
            CreateMap<Service, ServiceCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            //Service Update
            CreateMap<Service, ServiceUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            // ContractorApplication Create
            CreateMap<ContractorApplication, ContractorApplicationCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            // ContractorApplication Update
            CreateMap<ContractorApplication, ContractorApplicationUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            // Material Create
            CreateMap<Material, MaterialCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();
            // Material Update
            CreateMap<Material, MaterialUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            // Complex mapping (Response)
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
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => src.ServiceType.GetDisplayName())
                )
                .ForMember(
                    dest => dest.PackageOption,
                    opt =>
                        opt.MapFrom(src =>
                            src.PackageOption.HasValue
                                ? src.PackageOption.Value.GetDisplayName()
                                : null
                        )
                )
                .ForMember(
                    dest => dest.BuildingType,
                    opt => opt.MapFrom(src => src.BuildingType.GetDisplayName())
                )
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );

            CreateMap<ContractorApplication, ContractorApplicationDto>()
                .ForMember(
                    dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.GetDisplayName())
                )
                .ForMember(
                    dest => dest.ImageUrls,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                );
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
        }
    }
}
