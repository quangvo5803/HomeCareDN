using AutoMapper;
using BusinessLogic.DTOs.Application;
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

        public async Task<PagedResultDto<ConversationDto>> GetAllConversationByAdminIDAsync(
            ConversationGetByIdDto dto
        )
        {
            var query = _unitOfWork
                .ConversationRepository.GetQueryable()
                .Where(c => c.AdminID == dto.AdminID);

            if (!string.IsNullOrWhiteSpace(dto.Search))
            {
                query = await SearchDebounce(query, dto.Search);
            }

            query = query.OrderByDescending(c => c.IsAdminRead).ThenByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();

            var conversations = await query
                .Skip((dto.ConversationNumber - 1) * dto.ConversationSize)
                .Take(dto.ConversationSize)
                .ToListAsync();

            var result = _mapper.Map<List<ConversationDto>>(conversations);

            //Send with Role,Name,...
            foreach (var conversationDto in result)
            {
                await IncludedUserDataWithConversation(conversationDto);

                var unreadMessagesCount = await _unitOfWork
                    .ChatMessageRepository.GetQueryable()
                    .Where(m =>
                        m.ConversationID == conversationDto.ConversationID
                        && !m.IsAdminRead
                        && m.SenderID != dto.AdminID
                    )
                    .CountAsync();
                conversationDto.AdminUnreadMessageCount = unreadMessagesCount;
            }

            return new PagedResultDto<ConversationDto>
            {
                Items = result,
                TotalCount = totalCount,
                PageNumber = dto.ConversationNumber,
                PageSize = dto.ConversationSize,
            };
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
            conversation.IsAdminRead = true;

            await _unitOfWork
                .ChatMessageRepository.GetQueryable()
                .Where(m => m.ConversationID == id && !m.IsAdminRead)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsAdminRead, true));

            await _unitOfWork.SaveAsync();
        }

        public async Task<int> CountUnreadConversationsByAdminIDAsync(string id)
        {
            return await _unitOfWork
                .ConversationRepository.GetQueryable()
                .CountAsync(c => c.AdminID == id && !c.IsAdminRead);
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
        private async Task<IQueryable<Conversation>> SearchDebounce(
            IQueryable<Conversation> query,
            string input
        )
        {
            var search = input.ToLower().Trim();

            var userID = await _userManager
                .Users.Where(u =>
                    (!string.IsNullOrEmpty(u.Email) && u.Email.ToLower().Contains(search))
                    || (!string.IsNullOrEmpty(u.FullName) && u.FullName.ToLower().Contains(search))
                )
                .Select(u => u.Id)
                .ToListAsync();
            return query.Where(c => c.UserID != null && userID.Contains(c.UserID));
        }

        private async Task IncludedUserDataWithConversation(ConversationDto conversationDto)
        {
            if (!string.IsNullOrEmpty(conversationDto.UserID))
            {
                var user = await _userManager.FindByIdAsync(conversationDto.UserID);
                if (user != null)
                {
                    conversationDto.UserEmail = user.Email;
                    conversationDto.UserName = user.FullName;
                    var roles = await _userManager.GetRolesAsync(user);
                    conversationDto.UserRole = roles.FirstOrDefault();
                }
            }
        }
    }
}
