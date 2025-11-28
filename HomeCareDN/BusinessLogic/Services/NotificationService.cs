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
        private const string ADMIN = "Admin";
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
            bool isAdmin = role == ADMIN;

            var query = BuildBaseQuery(parameters, role, isAdmin);

            query = AdminSearchFilter(query, parameters, isAdmin);

            var totalCount = await query.CountAsync();

            query = AdminSorting(query, parameters, isAdmin);

            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            var dtoItems = _mapper.Map<IEnumerable<NotificationDto>>(items);

            if (!isAdmin)
            {
                foreach (var dto in dtoItems)
                {
                    if (dto.Type == NotificationType.System.ToString() && dto.PendingCount > 1)
                    {
                        dto.Message = $"Có {dto.PendingCount} {dto.Title.ToLower()}.";
                    }
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
                    ? $"Có {existing.PendingCount} {dto.Title.ToLower()}."
                    : dto.Title;

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

            var result = await CreateOrUpdateSystemAsync(dto, null);

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

            var result = await CreateOrUpdateSystemAsync(dto, null);
            
            await _unitOfWork.SaveAsync();
            return result;
        }

        // ==================== ADMIN ====================
        public async Task<NotificationDto> AdminSendSystemAsync
            (NotificationSystemCreateOrUpdateDto requestDto)
        {
            return await CreateOrUpdateSystemAsync(requestDto, ADMIN);
        }

        public async Task<NotificationDto> GetNotificationById(Guid id)
        {
            var notify = await _unitOfWork.NotificationRepository
                .GetAsync(n => n.NotificationID == id);
            if (notify == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Notification", new[] { "NotificationID NOT FOUND" } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<NotificationDto>(notify);
        }

        public async Task DeleteNotificationAsync(Guid id)
        {
            var noti = await _unitOfWork.NotificationRepository
                .GetAsync(n => n.NotificationID == id, asNoTracking:false);
            if (noti != null)
            {
                _unitOfWork.NotificationRepository.Remove(noti);
                await _unitOfWork.SaveAsync();
            }
            await SendToRolesAsync
            (
                noti!.TargetRoles!,
                "Notification.Deleted",
                noti.NotificationID
            );
        }
        // ==================== Helper ====================
        private async Task<NotificationDto> CreateOrUpdateSystemAsync
            (NotificationSystemCreateOrUpdateDto requestDto, string? role)
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
                noti.CreatedAt = DateTime.UtcNow;
                noti.UpdatedAt = DateTime.UtcNow;
                noti.PendingCount = 1;
                if (role == ADMIN)
                {
                    noti.Action = NotificationAction.Send;
                    noti.DataKey = "Admin_" + Guid.NewGuid().ToString("N").Substring(0, 10) + "_SEND";
                }
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
            var roleList = roles.Split(",").Select(x => x.Trim());
            foreach (var role in roleList)
            {
                var groupName = $"role_{role}";
                await _notifier.SendToApplicationGroupAsync(groupName, eventName, payload);
            }
        }

        private IQueryable<Notification> BuildBaseQuery(QueryParameters parameters, string role, bool isAdmin)
        {
            return _unitOfWork.NotificationRepository.GetQueryable()
                .Where(n =>
                    (n.Type == NotificationType.Personal && n.TargetUserId == parameters.FilterID) ||
                    (n.Type == NotificationType.System &&
                     (isAdmin ? n.SenderUserId == parameters.FilterID : n.TargetRoles!.Contains(role)))
                );
        }

        private IQueryable<Notification> AdminSearchFilter(
            IQueryable<Notification> query,
            QueryParameters parameters,
            bool isAdmin)
        {
            if (isAdmin && !string.IsNullOrEmpty(parameters.Search))
            {
                query = query.Where(n =>
                    n.Title.Contains(parameters.Search) ||
                    n.Message.Contains(parameters.Search));
            }

            return query;
        }

        private IQueryable<Notification> AdminSorting(
            IQueryable<Notification> query,
            QueryParameters parameters,
            bool isAdmin)
        {
            if (!isAdmin)
                return query.OrderByDescending(n => n.UpdatedAt);

            return parameters.SortBy?.ToLower() switch
            {
                "updatedat" => query.OrderBy(n => n.UpdatedAt),
                "updatedatdesc" => query.OrderByDescending(n => n.UpdatedAt),
                _ => query.OrderByDescending(n => n.CreatedAt)
            };
        }

    }
}
