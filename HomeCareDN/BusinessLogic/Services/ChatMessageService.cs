using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ChatMessageService : IChatMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ISignalRNotifier _signalRNotifier;

        private const string CONVERSATION = "Conversation";
        private const string MESSAGE = "Message";

        private const string ERROR_CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
        private const string ERROR_PERMISSION_DENIED = "PERMISSION_DENIED";
        private const string ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE";

        public ChatMessageService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ISignalRNotifier signalRNotifier
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _signalRNotifier = signalRNotifier;
        }

        public async Task<ChatMessageDto> SendMessageAsync(SendMessageRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(errors);
            }

            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == dto.ConversationID
            );

            if (conversation == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_CONVERSATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            bool isInConversation =
                conversation.CustomerID.ToString() == dto.SenderID
                || conversation.ContractorID.ToString() == dto.SenderID;
            if (!isInConversation)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_PERMISSION_DENIED } },
                };
                throw new CustomValidationException(errors);
            }

            var message = new ChatMessage
            {
                ChatMessageID = Guid.NewGuid(),
                ConversationID = dto.ConversationID,
                SenderID = dto.SenderID,
                ReceiverID = dto.ReceiverID,
                Content = dto.Content.Trim(),
                SentAt = DateTime.UtcNow,
            };

            await _unitOfWork.ChatMessageRepository.AddAsync(message);
            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<ChatMessageDto>(message);

            // realtime
            await _signalRNotifier.SendToGroupAsync(
                $"conv_{dto.ConversationID}",
                "Chat.MessageCreated",
                result
            );

            return result;
        }

        public async Task<PagedResultDto<ChatMessageDto>> GetAllMessagesByConversationIDAsync(
            Guid id,
            int pageNumber = 1,
            int pageSize = 20
        )
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );
            if (conversation == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONVERSATION, new[] { ERROR_CONVERSATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            // lấy 20 tin gần nhất
            var query = _unitOfWork
                .ChatMessageRepository.GetQueryable()
                .AsNoTracking()
                .Where(m => m.ConversationID == id)
                .OrderByDescending(m => m.SentAt);

            var total = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            // hiển thị tăng dần
            items.Reverse();

            var dtos = _mapper.Map<IEnumerable<ChatMessageDto>>(items);

            return new PagedResultDto<ChatMessageDto>
            {
                Items = dtos,
                TotalCount = total,
                PageNumber = pageNumber,
                PageSize = pageSize,
            };
        }
    }
}
