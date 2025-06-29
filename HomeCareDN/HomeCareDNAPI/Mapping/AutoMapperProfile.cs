using AutoMapper;
using BusinessLogic.DTOs.Application.ContractorApplication;
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
            //ServiceRequest Create
            CreateMap<ServiceRequest, ServiceRequestCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => (ServiceType)src.ServiceType)
                )
                .ForMember(
                    dest => dest.PackageOption,
                    opt =>
                        opt.MapFrom(src =>
                            src.PackageOption.HasValue
                                ? (PackageOption)src.PackageOption.Value
                                : (PackageOption?)null
                        )
                )
                .ForMember(
                    dest => dest.BuildingType,
                    opt => opt.MapFrom(src => (BuildingType)src.BuildingType)
                )
                .ForMember(
                    dest => dest.MainStructureType,
                    opt => opt.MapFrom(src => (MainStructureType)src.MainStructureType)
                )
                .ForMember(
                    dest => dest.DesignStyle,
                    opt => opt.MapFrom(src => (DesignStyle)src.DesignStyle)
                )
                .ForMember(dest => dest.Images, opt => opt.Ignore());
            // ServiceRequest Update
            CreateMap<ServiceRequest, ServiceRequestUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => (ServiceType)src.ServiceType)
                )
                .ForMember(
                    dest => dest.PackageOption,
                    opt =>
                        opt.MapFrom(src =>
                            src.PackageOption.HasValue
                                ? (PackageOption)src.PackageOption.Value
                                : (PackageOption?)null
                        )
                )
                .ForMember(
                    dest => dest.BuildingType,
                    opt => opt.MapFrom(src => (BuildingType)src.BuildingType)
                )
                .ForMember(
                    dest => dest.MainStructureType,
                    opt => opt.MapFrom(src => (MainStructureType)src.MainStructureType)
                )
                .ForMember(
                    dest => dest.DesignStyle,
                    opt => opt.MapFrom(src => (DesignStyle)src.DesignStyle)
                )
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // ContractorApplication Create and Update
            CreateMap<ContractorApplication, ContractorApplicationCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<ContractorApplication, ContractorApplicationUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ContractorApplicationUpdateRequestDto, ContractorApplication>()
                .ForMember(
                    dest => dest.Status,
                    opt => opt.MapFrom(src => (ApplicationStatus)src.Status)
                )
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            //Service Create
            CreateMap<Service, ServiceCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => (ServiceType)src.ServiceType)
                )
                .ForMember(
                    dest => dest.PackageOption,
                    opt =>
                        opt.MapFrom(src =>
                            src.PackageOption.HasValue
                                ? (PackageOption)src.PackageOption.Value
                                : (PackageOption?)null
                        )
                )
                .ForMember(
                    dest => dest.BuildingType,
                    opt => opt.MapFrom(src => (BuildingType)src.BuildingType)
                )
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            //Service Update
            CreateMap<Service, ServiceUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<ServiceUpdateRequestDto, Service>()
                .ForMember(
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => (ServiceType)src.ServiceType)
                )
                .ForMember(
                    dest => dest.PackageOption,
                    opt =>
                        opt.MapFrom(src =>
                            src.PackageOption.HasValue
                                ? (PackageOption)src.PackageOption.Value
                                : (PackageOption?)null
                        )
                )
                .ForMember(
                    dest => dest.BuildingType,
                    opt => opt.MapFrom(src => (BuildingType)src.BuildingType)
                )
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // Complex mapping (Response)
            //ServiceRequest
            CreateMap<ServiceRequest, ServiceRequestDto>()
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
                    dest => dest.MainStructureType,
                    opt => opt.MapFrom(src => src.MainStructureType.GetDisplayName())
                )
                .ForMember(
                    dest => dest.DesignStyle,
                    opt => opt.MapFrom(src => src.DesignStyle.GetDisplayName())
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

            //ContractorApplication
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
        }
    }
}
