using AutoMapper;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using Ultitity.Extensions;

namespace HomeCareDNAPI.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<ServiceRequest, ServiceRequestCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<ServiceRequest, ServiceRequestUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<ContractorApplication, ContractorApplicationCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<ContractorApplication, ContractorApplicationUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ReverseMap();

            // Complex mapping (Response)
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


            //Service Create
            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore()).ReverseMap();

            //Service Update
            CreateMap<ServiceUpdateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore()).ReverseMap();

        }
    }
}
