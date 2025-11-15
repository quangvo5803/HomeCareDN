using AutoMapper;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        private const string CONVERSATION = "Conversation";
        private const string ERROR_CONVERSATIONS_NOT_FOUND = "CONVERSATIONS_NOT_FOUND";

        public ConversationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<ConversationDto?> GetConversationByIDAsync(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(
                c => c.ConversationID == id,
                asNoTracking: false
            );
            if (conversation == null)
            {
                return null;
            }
            var result = _mapper.Map<ConversationDto>(conversation);
            return result;
        }

        public async Task<ConversationDto?> GetConversationByUserIDAsync(string id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.UserID == id && c.ConversationType == ConversationType.AdminSupport
            );
            if (conversation == null)
            {
                return null;
            }
            var result = _mapper.Map<ConversationDto>(conversation);
            return result;
        }

        public async Task<IEnumerable<ConversationDto>> GetAllConversationByAdminIDAsync(string id)
        {
            var conversations = await _unitOfWork
                .ConversationRepository.GetQueryable()
                .Where(c => c.AdminID == id)
                .OrderByDescending(c => c.AdminUnreadCount)
                .ThenByDescending(c => c.CreatedAt)
                .ToListAsync();

            if (conversations.Count == 0)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_CONVERSATIONS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var result = _mapper.Map<IEnumerable<ConversationDto>>(conversations);
            //LINQ
            var tasks = result.Select(
                async (dto) =>
                {
                    if (!string.IsNullOrEmpty(dto.UserID))
                    {
                        var user = await _userManager.FindByIdAsync(dto.UserID);
                        if (user != null)
                        {
                            dto.UserEmail = user.Email;
                            dto.UserName = user.FullName;
                            var roles = await _userManager.GetRolesAsync(user);
                            dto.UserRole = roles.FirstOrDefault();
                        }
                    }
                }
            );
            await Task.WhenAll(tasks);

            return result;
        }

        public async Task MarkConversationAsReadAsync(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(
                c => c.ConversationID == id,
                asNoTracking: false
            );
            if (conversation == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_CONVERSATIONS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            else
            {
                conversation.AdminUnreadCount = 0;
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
