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
            // Enum to string mapping
            CreateMap<ServiceType, string>()
                .ConvertUsing(src => src.GetDisplayName());
            CreateMap<PackageOption, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<BuildingType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<MainStructureType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<DesignStyle, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<ApplicationStatus, string>().ConvertUsing(src => src.GetDisplayName());

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

            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

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

            CreateMap<ContractorApplicationCreateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ContractorApplicationUpdateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // Service
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

            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceUpdateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());
        }
    }
}
