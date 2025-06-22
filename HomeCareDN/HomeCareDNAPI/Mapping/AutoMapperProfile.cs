using AutoMapper;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using Ultitity.Extensions;

namespace HomeCareDNAPI.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Mapping CreateRequestDto → ServiceRequest
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // Mapping ServiceRequest → CreateRequestDto
            CreateMap<ServiceRequest, ServiceRequestCreateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());
            // Mapping UpdateRequestDto
            // Mapping UpdateRequestDto
            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceRequest, ServiceRequestUpdateRequestDto>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

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
        }
    }
}
