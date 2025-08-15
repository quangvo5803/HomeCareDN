using AutoMapper;
using BusinessLogic.DTOs.Application.CartItem;
using BusinessLogic.DTOs.Application.Cart;
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

            // Cart Create
            CreateMap<CartCreateRequestDto, Cart>()
                .ForMember(dest => dest.CartItems, opt => opt.Ignore());

            // CartItem Create
            CreateMap<CartItemCreateRequestDto, CartItem>()
                .ForMember(dest => dest.Cart, opt => opt.Ignore())
                .ForMember(dest => dest.Material, opt => opt.Ignore());




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
            // Cart
            CreateMap<Cart, CartDto>()
                .ForMember(
                    dest => dest.CartItems,
                    opt => opt.MapFrom(src => src.CartItems != null ? src.CartItems : new List<CartItem>())
                );
            // CartItem
            CreateMap<CartItem, CartItemDto>()
                .ForMember(
                    dest => dest.Material,
                    opt => opt.MapFrom(src => src.Material)
                );


        }
    }
}
