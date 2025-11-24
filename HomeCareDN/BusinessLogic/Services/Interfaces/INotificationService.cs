using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Notification;
using DataAccess.Entities.Application;

namespace BusinessLogic.Services.Interfaces
{
    public interface INotificationService
    {
        Task<PagedResultDto<NotificationDto>> GetAllNotificationsAsync
            (QueryParameters parameters, string role);
        Task<NotificationDto> AdminSendSystemAsync(NotificationSystemCreateOrUpdateDto requestDto);
        Task<NotificationDto> NotifyApplyToRequestAsync(ApplyNotificationDto dto);
        Task<NotificationDto> NotifyPersonalAsync(ApplyNotificationDto dto);
        Task<NotificationDto> NotifyNewServiceRequestAsync(ServiceRequest request);
        Task<NotificationDto> NotifyNewMaterialRequestAsync(MaterialRequest request);
    }
}
