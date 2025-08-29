using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.DTOs.Application.Category;
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
            // ------------------------
            // Enum to string mapping
            // ------------------------
            MapEnumsToString();

            // ------------------------
            // Create/Update DTO -> Entity (Write)
            // ------------------------
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ContractorApplicationCreateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<MaterialCreateRequestDto, Material>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<CategoryCreateRequestDto, Category>();

            CreateMap<BrandCreateRequestDto, Brand>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            // ------------------------
            // Entity -> DTO (Read / Response)
            // ------------------------
            CreateMap<ServiceRequest, ServiceRequestDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                );

            CreateMap<Service, ServiceDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                );

            CreateMap<ContractorApplication, ContractorApplicationDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                );

            CreateMap<Material, MaterialDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.BrandName,
                    opt =>
                        opt.MapFrom(src => src.Brand != null ? src.Brand.BrandName : string.Empty)
                );

            CreateMap<Category, CategoryDto>().ReverseMap();

            CreateMap<Brand, BrandDto>()
                .ForMember(
                    dest => dest.BrandLogo,
                    opt =>
                        opt.MapFrom(src =>
                            src.LogoImage != null ? src.LogoImage.ImageUrl : string.Empty
                        )
                )
                .ForMember(dest => dest.Materials, opt => opt.MapFrom(src => src.Materials));
        }

        // ------------------------
        // Helper method for enums
        // ------------------------
        private void MapEnumsToString()
        {
            CreateMap<ServiceType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<PackageOption, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<BuildingType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<MainStructureType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<DesignStyle, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<ApplicationStatus, string>().ConvertUsing(src => src.GetDisplayName());
        }

        // ------------------------
        // Helper method for ImageUrls
        // ------------------------
        private List<string> ImagesToUrls(IEnumerable<Image>? images)
        {
            return images?.Select(i => i.ImageUrl).ToList() ?? new List<string>();
        }
    }
}
