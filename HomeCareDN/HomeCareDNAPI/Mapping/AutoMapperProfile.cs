using AutoMapper;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using BusinessLogic.DTOs.Authorize.Profiles;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
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
            // Create DTO -> Entity (Write)
            // ------------------------
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ServiceCreateRequestDto, Service>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<ContractorApplicationCreateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<MaterialCreateRequestDto, Material>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<CategoryCreateRequestDto, Category>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<BrandCreateRequestDto, Brand>()
                .ForMember(dest => dest.LogoImage, opt => opt.Ignore());

            CreateMap<CreateAddressDto, Address>();

            // ------------------------
            // Update DTO -> Entity (Write)
            // ------------------------
            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

            CreateMap<UpdateAddressDto, Address>()
                // Ignore AddressId and UserId to prevent overwriting them
                .ForMember(d => d.AddressId, opt => opt.Ignore())
                .ForMember(d => d.UserId, opt => opt.Ignore());

            CreateMap<UpdateProfileDto, ApplicationUser>()
                // Ignore Id to prevent overwriting them
                .ForMember(d => d.Id, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ContractorApplicationUpdateRequestDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());

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
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                )
                .ForMember(
                    dest => dest.ImagePublicIds,
                    opt => opt.MapFrom(src =>
                        src.Images != null
                            ? src.Images.Select(i => i.PublicId).ToList()
                            : new List<string>()
                    )
                );

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

            CreateMap<ContractorApplication, ContractorApplicationDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
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
                    opt => opt.MapFrom(src =>
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
                )
                .ForMember(
                    dest => dest.MaterialCount,
                    opt => 
                    opt.MapFrom(src => src.Materials!.Count)
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
                )
                .ForMember(dest => dest.Materials, opt => opt.MapFrom(src => src.Materials))
                .ForMember(
                    dest => dest.MaterialCount,
                    opt =>
                    opt.MapFrom(src => src.Materials!.Count)
                );

            CreateMap<Address, AddressDto>();

            CreateMap<ApplicationUser, ProfileDto>()
                .ForMember(d => d.UserId, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.Email, opt => opt.MapFrom(s => s.Email ?? string.Empty));

            //Chat DTOs
            CreateMap<StartConversationRequestDto, Conversation>()
                .ForMember(d => d.ConversationId, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(d => d.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.LastMessageAt, opt => opt.Ignore())
                .ForMember(d => d.Messages, opt => opt.Ignore());

            CreateMap<StartConversationRequestDto, ChatMessage>()
                .ForMember(d => d.ChatMessageId, opt => opt.MapFrom(_ => Guid.NewGuid()))
                // ConversationId sẽ truyền động qua opts.Items["ConversationId"]
                .ForMember(
                    d => d.ConversationId,
                    opt => opt.MapFrom((src, _, __, ctx) => (Guid)ctx.Items["ConversationId"])
                )
                .ForMember(d => d.SenderId, opt => opt.MapFrom(src => src.CustomerId))
                .ForMember(d => d.ReceiverId, opt => opt.MapFrom(src => src.ContractorId))
                .ForMember(
                    d => d.Content,
                    opt => opt.MapFrom(src => src.FirstMessage ?? string.Empty)
                )
                .ForMember(d => d.SentAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.IsRead, opt => opt.MapFrom(_ => false));

            CreateMap<SendMessageRequestDto, ChatMessage>()
                .ForMember(d => d.ChatMessageId, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(
                    d => d.SenderId,
                    opt =>
                        opt.MapFrom(
                            (src, _, __, ctx) =>
                                ctx.Items.TryGetValue("SenderId", out var v)
                                    ? v?.ToString()!
                                    : string.Empty
                        )
                )
                .ForMember(d => d.SentAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.IsRead, opt => opt.MapFrom(_ => false));

            CreateMap<Conversation, ConversationDto>();
            CreateMap<ChatMessage, ChatMessageDto>().ReverseMap();

            // ContactSupport
            CreateMap<ContactSupportCreateRequestDto, ContactSupport>();
            CreateMap<ContactSupport, ContactSupportDto>();
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
        private static List<string> ImagesToUrls(IEnumerable<Image>? images)
        {
            return images?.Select(i => i.ImageUrl).ToList() ?? new List<string>();
        }
    }
}
