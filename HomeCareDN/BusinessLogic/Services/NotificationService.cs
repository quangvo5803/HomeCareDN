using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ISignalRNotifier _notifier;
        private readonly UserManager<ApplicationUser> _userManager;
        public NotificationService
        (
            IUnitOfWork unitOfWork, IMapper mapper, 
            ISignalRNotifier notifier, 
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _notifier = notifier;
            _userManager = userManager;
        }
        public async Task<PagedResultDto<NotificationDto>> GetAllNotificationsAsync
            (QueryParameters parameters, string role)
        {
            var personalQuery = _unitOfWork.NotificationRepository.GetQueryable()
                .Where(n => n.Type == NotificationType.Personal
                            && n.TargetUserId == parameters.FilterID);

            var systemQuery = _unitOfWork.NotificationRepository.GetQueryable()
                .Where(n => n.Type == NotificationType.System
                            && (n.TargetRoles!.Contains(role) || n.TargetRoles.ToLower() == "all"));

            var query = personalQuery.Union(systemQuery)
                .OrderByDescending(n => n.UpdatedAt);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            var dtoItems = _mapper.Map<IEnumerable<NotificationDto>>(items);

            foreach (var dto in dtoItems)
            {
                if (dto.Type == NotificationType.System.ToString() && dto.PendingCount > 1)
                {
                    dto.Message = $"Có {dto.PendingCount} {dto.Title.ToLower()}.";
                }
            }

            return new PagedResultDto<NotificationDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize
            };
        }

        public async Task<NotificationDto> AdminSendSystemAsync
            (NotificationSystemCreateOrUpdateDto requestDto)
        {
            return await CreateOrUpdateSystemAsync(requestDto);
        }

        public async Task<NotificationDto> NotifyPersonalAsync(NotificationPersonalCreateOrUpdateDto dto)
        {
            var existing = await _unitOfWork.NotificationRepository
                .GetAsync(n => n.Type == NotificationType.Personal
                                && n.DataKey == dto.DataKey, asNoTracking: false);

            Notification noti;

            if (existing != null && !existing.IsRead)
            {
                if (dto.Action == NotificationAction.Apply)
                {
                    existing.PendingCount++;
                }
                else if (dto.Action == NotificationAction.Accept ||
                    dto.Action == NotificationAction.Reject || dto.Action == NotificationAction.Paid)
                {
                    existing.PendingCount = 0;
                }

                existing.Title = dto.Title;
                existing.Message = existing.PendingCount > 1 && dto.Action == NotificationAction.Apply
                    ? $"Có {existing.PendingCount} {dto.Message.ToLower()}."
                    : dto.Message;

                existing.Action = dto.Action;
                existing.UpdatedAt = DateTime.UtcNow;

                noti = existing;
            }
            else
            {
                noti = _mapper.Map<Notification>(dto);
                noti.Type = NotificationType.Personal;
                noti.IsRead = false;
                noti.PendingCount = dto.Action == NotificationAction.Apply ? 1 : 0;
                noti.CreatedAt = DateTime.UtcNow;
                noti.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.NotificationRepository.AddAsync(noti);
            }

            await _unitOfWork.SaveAsync();

            var mapped = _mapper.Map<NotificationDto>(noti);

            var eventName = dto.Action switch
            {
                NotificationAction.Apply => "Notification.Application.Create",
                NotificationAction.Paid => "Notification.Application.Paid",
                _ => "Notification.Application.Update"
            };

            await _notifier.SendToApplicationGroupAsync(
                $"user_{dto.TargetUserId}",
                eventName,
                mapped
            );

            return mapped;
        }

        public async Task<Notification?> ReadNotificationAsync(Guid id)
        {
            var noti = await _unitOfWork.NotificationRepository
                .GetAsync(n => n.NotificationID == id, asNoTracking: false);
            if (noti != null)
            {
                noti.IsRead = true;
                noti.PendingCount = 0;
                await _unitOfWork.SaveAsync();
            }
            return noti;
        }

        public async Task<bool> ReadAllNotificationsAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "UserId", new[] { "UserId Not Found" } },
                };
                throw new CustomValidationException(errors);
            }
            var userRoles = await _userManager.GetRolesAsync(user);

            var allNotifications = await _unitOfWork.NotificationRepository
                .GetRangeAsync(n => !n.IsRead
                    && (n.TargetUserId == userId || (n.TargetUserId == null && n.TargetRoles != null)),
                    asNoTracking:false
                );

            var notificationsToMark = allNotifications
                .Where(n => n.TargetUserId == userId
                    || (n.TargetUserId == null
                        && n.TargetRoles!
                            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                            .Any(r => userRoles.Contains(r))
                    ))
                .ToList();

            foreach (var noti in notificationsToMark)
            {
                noti.IsRead = true;
                noti.PendingCount = 0;
                noti.UpdatedAt = DateTime.UtcNow;
            }

            await _unitOfWork.SaveAsync();
            return true;
        }

        public async Task<NotificationDto> NotifyNewServiceRequestAsync(ServiceRequest request)
        {
            const string dataKey = "ServiceRequest";

            var dto = new NotificationSystemCreateOrUpdateDto
            {
                Title = "Yêu cầu dịch vụ mới",
                Message = "Có 1 yêu cầu dịch vụ mới.",
                DataKey = dataKey,
                DataValue = "ServiceRequestManager",
                TargetRoles = "Contractor"
            };

            var result = await CreateOrUpdateSystemAsync(dto);

            return result;
        }

        public async Task<NotificationDto> NotifyNewMaterialRequestAsync(MaterialRequest request)
        {
            const string dataKey = "MaterialRequest";

            var dto = new NotificationSystemCreateOrUpdateDto
            {
                Title = "Yêu cầu vật tư mới",
                Message = "Có 1 yêu cầu vật tư mới.",
                DataKey = dataKey,
                DataValue = "MaterialRequestManager",
                TargetRoles = "Distributor"
            };

            var result = await CreateOrUpdateSystemAsync(dto);
            
            await _unitOfWork.SaveAsync();
            return result;
        }

        // ==================== Helper ====================
        private async Task<NotificationDto> CreateOrUpdateSystemAsync
            (NotificationSystemCreateOrUpdateDto requestDto)
        {
            var existing = await _unitOfWork.NotificationRepository
                .GetAsync(n => n.Type == NotificationType.System
                    && n.DataKey == requestDto.DataKey, asNoTracking: false
                );
            Notification noti;

            if (existing != null && !existing.IsRead)
            {
                existing.PendingCount++;
                existing.UpdatedAt = DateTime.UtcNow;

                _mapper.Map(requestDto, existing);
                noti = existing;
            }
            else
            {
                noti = _mapper.Map<Notification>(requestDto);
                noti.Type = NotificationType.System;
                noti.PendingCount = 1;
                noti.CreatedAt = DateTime.UtcNow;
                noti.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.NotificationRepository.AddAsync(noti);
            }
            await _unitOfWork.SaveAsync();

            var dto = _mapper.Map<NotificationDto>(noti);
            dto.Message = noti.PendingCount > 1
               ? $"Có {noti.PendingCount} {noti.Title.ToLower()}."
               : noti.Message;

            await SendToRolesAsync
            (
                requestDto.TargetRoles, 
                "Notification.Created", 
                dto
            );

            return dto;
        }

        private async Task SendToRolesAsync(string roles, string eventName, object payload)
        {
            if (roles.ToLower() == "all")
            {
                await _notifier.SendToAllApplicationAsync(eventName, payload);
                return;
            }

            var roleList = roles.Split(",").Select(x => x.Trim());
            foreach (var role in roleList)
            {
                var groupName = $"role_{role}";
                await _notifier.SendToApplicationGroupAsync(groupName, eventName, payload);
            }
        }
    }
}
