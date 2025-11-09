using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;
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

            var conversation = await _unitOfWork.ConversationRepository.GetAsync(
                c => c.ConversationID == dto.ConversationID,
                includeProperties: null,
                asNoTracking: false
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
                conversation.CustomerID == dto.SenderID
                || conversation.ContractorID == dto.SenderID;
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
            await _signalRNotifier.SendToChatGroupAsync(
                $"conversation_{dto.ConversationID}",
                "Chat.MessageCreated",
                result
            );

            return result;
        }

        public async Task<PagedResultDto<ChatMessageDto>> GetAllMessagesByConversationIDAsync(
            ChatMessageGetByIdDto dto
        )
        {
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

            // lấy 20 tin gần nhất
            var query = _unitOfWork
                .ChatMessageRepository.GetQueryable()
                .AsNoTracking()
                .Where(m => m.ConversationID == dto.ConversationID)
                .OrderByDescending(m => m.SentAt);

            var totalMesage = await query.CountAsync();
            var itemMessages = await query
                .Skip((dto.messageNumber - 1) * dto.messageSize)
                .Take(dto.messageSize)
                .ToListAsync();

            // hiển thị tăng dần
            itemMessages.Reverse();

            var messages = _mapper.Map<IEnumerable<ChatMessageDto>>(itemMessages);

            return new PagedResultDto<ChatMessageDto>
            {
                Items = messages,
                TotalCount = totalMesage,
                PageNumber = dto.messageNumber,
                PageSize = dto.messageSize,
            };
        }
    }
}
