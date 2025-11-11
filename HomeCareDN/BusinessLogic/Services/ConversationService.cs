using AutoMapper;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string CONVERSATION = "Conversation";
        private const string ERROR_CONVERSATIONS_NOT_FOUND = "CONVERSATIONS_NOT_FOUND";

        public ConversationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ConversationDto?> GetConversationByIDAsync(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );
            if (conversation == null)
            {
                return null;
            }
            var result = _mapper.Map<ConversationDto>(conversation);
            return result;
        }

        public async Task<IEnumerable<ConversationDto>> GetAllConversationByAdminIDAsync(Guid id)
        {
            var conversations = await _unitOfWork
                .ConversationRepository.GetQueryable()
                .Where(c => c.AdminID == id)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            if (conversations == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_CONVERSATIONS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var result = _mapper.Map<IEnumerable<ConversationDto>>(conversations);
            return result;
        }
    }
}
