using AutoMapper;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.DTOs.Authorize.User;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using Ultitity.Extensions;

namespace BusinessLogic.Mapping
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
            // Create DTO -> Entity (Write)
            // ------------------------
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<MaterialCreateRequestDto, Material>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<CategoryCreateRequestDto, Category>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<BrandCreateRequestDto, Brand>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<CreateAddressDto, Address>();
            CreateMap<PartnerRequestCreateRequestDto, PartnerRequest>()
                .ForMember(d => d.Images, opt => opt.Ignore());
            CreateMap<ContractorCreateApplicationDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());
            CreateMap<MaterialRequestCreateRequestDto, MaterialRequest>();
            // ------------------------
            // Update DTO -> Entity (Write)
            // ------------------------
            CreateMap<MaterialRequestUpdateRequestDto, MaterialRequest>();
            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<UpdateAddressDto, Address>()
                // Ignore AddressId and UserId to prevent overwriting them
                .ForMember(d => d.AddressID, opt => opt.Ignore())
                .ForMember(d => d.UserId, opt => opt.Ignore());

            CreateMap<UpdateProfileDto, ApplicationUser>()
                // Ignore Id to prevent overwriting them
                .ForMember(d => d.Id, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<MaterialUpdateRequestDto, Material>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<CategoryUpdateRequestDto, Category>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<BrandUpdateRequestDto, Brand>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<ServiceUpdateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            // ------------------------
            // Entity -> DTO (Read / Response)
            // ------------------------
            CreateMap<ServiceRequest, ServiceRequestDto>()
                .ForMember(
                    dest => dest.ContractorApplyCount,
                    opt =>
                        opt.MapFrom(src =>
                            src.ContractorApplications != null
                                ? src.ContractorApplications.Count
                                : 0
                        )
                )
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                )
                .ForMember(dest => dest.Conversation, opt => opt.MapFrom(src => src.Conversation));
            CreateMap<Service, ServiceDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                );
            CreateMap<Service, ServiceDetailDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                );

            CreateMap<ContractorApplication, ContractorApplicationDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ServiceType,
                    opt => opt.MapFrom(src => src.ServiceRequest!.ServiceType)
                );

            CreateMap<Material, MaterialDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand!.BrandName))
                .ForMember(
                    dest => dest.CategoryID,
                    otp => otp.MapFrom(src => src.Category!.CategoryID)
                )
                .ForMember(
                    dest => dest.BrandNameEN,
                    opt => opt.MapFrom(src => src.Brand!.BrandNameEN)
                )
                .ForMember(
                    dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category!.CategoryName)
                )
                .ForMember(
                    dest => dest.CategoryNameEN,
                    opt => opt.MapFrom(src => src.Category!.CategoryNameEN)
                )
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                );
            CreateMap<Material, MaterialDetailDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand!.BrandName))
                .ForMember(
                    dest => dest.CategoryID,
                    otp => otp.MapFrom(src => src.Category!.CategoryID)
                )
                .ForMember(
                    dest => dest.BrandNameEN,
                    opt => opt.MapFrom(src => src.Brand!.BrandNameEN)
                )
                .ForMember(
                    dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category!.CategoryName)
                )
                .ForMember(
                    dest => dest.CategoryNameEN,
                    opt => opt.MapFrom(src => src.Category!.CategoryNameEN)
                )
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Images != null
                                ? src.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                );
            CreateMap<Category, CategoryDto>()
                .ForMember(
                    dest => dest.CategoryLogo,
                    opt => opt.MapFrom(src => src.LogoImage!.ImageUrl)
                )
                .ForMember(
                    dest => dest.CategoryLogoPublicId,
                    opt =>
                        opt.MapFrom(src =>
                            src.LogoImage != null ? src.LogoImage.PublicId : string.Empty
                        )
                );

            CreateMap<Brand, BrandDto>()
                .ForMember(
                    dest => dest.BrandLogo,
                    opt =>
                        opt.MapFrom(src =>
                            src.LogoImage != null ? src.LogoImage.ImageUrl : string.Empty
                        )
                )
                .ForMember(
                    dest => dest.BrandLogoPublicId,
                    opt =>
                        opt.MapFrom(src =>
                            src.LogoImage != null ? src.LogoImage.PublicId : string.Empty
                        )
                );

            CreateMap<Address, AddressDto>();

            CreateMap<ApplicationUser, ProfileDto>()
                .ForMember(d => d.UserId, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.Email, opt => opt.MapFrom(s => s.Email ?? string.Empty));

            // ContactSupport
            CreateMap<ContactSupportCreateRequestDto, ContactSupport>();
            CreateMap<ContactSupport, ContactSupportDto>();

            // Partner
            CreateMap<PartnerRequest, PartnerRequestDto>()
                .ForMember(
                    d => d.ImageUrls,
                    opt =>
                        opt.MapFrom(s =>
                            s.Images != null
                                ? s.Images.Select(i => i.ImageUrl).ToList()
                                : new List<string>()
                        )
                )
                .ForMember(
                    d => d.ImagePublicIds,
                    opt =>
                        opt.MapFrom(s =>
                            s.Images != null
                                ? s.Images.Select(i => i.PublicId).ToList()
                                : new List<string>()
                        )
                );
            CreateMap<MaterialRequest, MaterialRequestDto>()
                .ForMember(
                    dest => dest.DistributorApplyCount,
                    opt =>
                        opt.MapFrom(src =>
                            src.DistributorApplications != null
                                ? src.DistributorApplications.Count
                                : 0
                        )
                )
                .AfterMap(
                    (src, dest) =>
                    {
                        if (dest.MaterialRequestItems != null)
                        {
                            foreach (var item in dest.MaterialRequestItems)
                            {
                                if (item.Material != null)
                                {
                                    var material = item.Material;
                                    if (material == null)
                                        continue;

                                    material.Description = null;
                                    material.DescriptionEN = null;
                                    material.UserID = string.Empty;

                                    if (material.Images != null && material.Images.Any())
                                    {
                                        material.Images = new List<Image>
                                        {
                                            material.Images.First(),
                                        };
                                    }
                                }
                            }
                        }
                    }
                );

            CreateMap<ApplicationUser, UserDto>()
                .ForMember(dest => dest.UserID, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Addresses));
            CreateMap<Conversation, ConversationDto>();
            CreateMap<ChatMessage, ChatMessageDto>()
                .ForMember(d => d.SentAt, opt => opt.MapFrom(s => s.SentAt));

            CreateMap<PaymentTransaction, PaymentTransactionDto>();
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
            CreateMap<PartnerRequestType, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<PartneRequestrStatus, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<RequestStatus, string>().ConvertUsing(src => src.GetDisplayName());
            CreateMap<Gender, string>().ConvertUsing(src => src.GetDisplayName());
        }

        // ------------------------
        // Helper method for ImageUrls
        // ------------------------
        private static List<string> ImagesToUrls(IEnumerable<Image>? images)
        {
            return images?.Select(i => i.ImageUrl).ToList() ?? new List<string>();
        }
    }
}
