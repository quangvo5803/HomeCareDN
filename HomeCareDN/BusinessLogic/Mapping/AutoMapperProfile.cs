using AutoMapper;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.DTOs.Application.DistributorApplication.Items;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.DTOs.Application.Review;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ServiceRequest;
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
            CreateMap<ReviewCreateRequestDto, Review>()
                .ForMember(dest => dest.Images, opt => opt.Ignore());
            CreateMap<ServiceRequestCreateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Documents, opt => opt.Ignore());

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
                .ForMember(d => d.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Documents, opt => opt.Ignore());
            CreateMap<ContractorCreateApplicationDto, ContractorApplication>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Documents, opt => opt.Ignore());
            CreateMap<MaterialRequestCreateRequestDto, MaterialRequest>();
            CreateMap<DistributorCreateApplicationDto, DistributorApplication>();
            CreateMap<DistributorCreateApplicationItemDto, DistributorApplicationItem>();
            CreateMap<NotificationPersonalCreateOrUpdateDto, Notification>();
            CreateMap<NotificationSystemCreateOrUpdateDto, Notification>();

            // ------------------------
            // Update DTO -> Entity (Write)
            // ------------------------
            CreateMap<MaterialRequestUpdateRequestDto, MaterialRequest>();
            CreateMap<ServiceRequestUpdateRequestDto, ServiceRequest>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Documents, opt => opt.Ignore());

            CreateMap<UpdateAddressDto, Address>()
                // Ignore AddressId and UserId to prevent overwriting them
                .ForMember(d => d.AddressID, opt => opt.Ignore())
                .ForMember(d => d.UserId, opt => opt.Ignore());

            CreateMap<UpdateUserDto, ApplicationUser>()
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
            CreateMap<NotificationPersonalCreateOrUpdateDto, Notification>();
            CreateMap<NotificationSystemCreateOrUpdateDto, Notification>();

            // ------------------------
            // Entity -> DTO (Read / Response)
            // ------------------------
            CreateMap<Review, ReviewDto>()
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Images))
                );

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
                .ForMember(dest => dest.Review, opt => opt.MapFrom(src => src.Review))
                .ForMember(
                    dest => dest.DocumentUrls,
                    opt => opt.MapFrom(src => DocumentsToUrls(src.Documents))
                )
                .ForMember(
                    dest => dest.DocumentPublicIds,
                    opt =>
                        opt.MapFrom(src =>
                            src.Documents != null
                                ? src.Documents.Select(d => d.PublicId).ToList()
                                : new List<string>()
                        )
                )
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
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
                    dest => dest.DocumentUrls,
                    opt => opt.MapFrom(src => DocumentsToUrls(src.Documents))
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
                )
                .ForMember(
                    dest => dest.DocumentUrls,
                    opt => opt.MapFrom(src => DocumentsToUrls(src.Documents))
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
                .ForMember(dest => dest.Addresses, opt => opt.MapFrom(src => src.Addresses));

            CreateMap<Conversation, ConversationDto>()
                .ForMember(
                    dest => dest.ConversationID,
                    opt => opt.MapFrom(src => src.ConversationID)
                )
                .ForMember(dest => dest.UserID, opt => opt.MapFrom(src => src.UserID))
                .ForMember(dest => dest.AdminID, opt => opt.MapFrom(src => src.AdminID))
                .ForMember(
                    dest => dest.ConversationType,
                    opt => opt.MapFrom(src => src.ConversationType)
                )
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));
            CreateMap<ChatMessage, ChatMessageDto>()
                .ForMember(d => d.SentAt, opt => opt.MapFrom(s => s.SentAt));

            CreateMap<PaymentTransaction, PaymentTransactionDto>();

            CreateMap<DistributorApplication, DistributorApplicationDto>();
            CreateMap<DistributorApplicationItem, DistributorApplicationItemDto>()
                 .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => src.Material!.Name))
                .ForMember(dest => dest.BrandName,
                    opt => opt.MapFrom(src => src.Material!.Brand!.BrandName))
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Material!.Category!.CategoryName))
                .ForMember(dest => dest.NameEN,
                    opt => opt.MapFrom(src => src.Material!.NameEN))
                .ForMember(dest => dest.BrandNameEN,
                    opt => opt.MapFrom(src => src.Material!.Brand!.BrandNameEN))
                .ForMember(dest => dest.CategoryNameEN,
                    opt => opt.MapFrom(src => src.Material!.Category!.CategoryNameEN))
                .ForMember(dest => dest.Unit,
                    opt => opt.MapFrom(src => src.Material!.Unit))
                .ForMember(dest => dest.UnitEN,
                    opt => opt.MapFrom(src => src.Material!.UnitEN))
                .ForMember(
                    dest => dest.ImageUrls,
                    opt => opt.MapFrom(src => ImagesToUrls(src.Material!.Images))
                );

            CreateMap<Notification, NotificationDto>();
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
            CreateMap<ConversationType, string>().ConvertUsing(src => src.GetDisplayName());
        }

        // ------------------------
        // Helper method for ImageUrls
        // ------------------------
        private static List<string> ImagesToUrls(IEnumerable<Image>? images)
        {
            return images?.OrderBy(i => i.ImageID).Select(i => i.ImageUrl).ToList()
                ?? new List<string>();
        }

        private static List<string> DocumentsToUrls(IEnumerable<Document>? documents)
        {
            return documents?.Select(i => i.DocumentUrl).ToList() ?? new List<string>();
        }
    }
}
