using AutoMapper;
using BusinessLogic.DTOs.Chat;
using BusinessLogic.DTOs.Chat.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public ConversationService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<ConversationDto> StartConversationAsync(StartConversationRequestDto dto)
        {
            // Map DTO -> Conversation
            var conv = _mapper.Map<Conversation>(dto);

            await _uow.ConversationRepository.AddAsync(conv);
            await _uow.SaveAsync();

            // Nếu có tin nhắn mở đầu, map tiếp DTO -> ChatMessage
            if (!string.IsNullOrWhiteSpace(dto.FirstMessage))
            {
                var msg = _mapper.Map<ChatMessage>(dto, opts =>
                {
                    opts.Items["ConversationId"] = conv.ConversationId;
                });

                await _uow.ChatMessageRepository.AddAsync(msg);
                conv.LastMessageAt = msg.SentAt;
                await _uow.SaveAsync();
            }

            return _mapper.Map<ConversationDto>(conv);
        }

        public async Task<IEnumerable<ConversationDto>> GetMyConversationsAsync(string userId)
        {
            var list = await _uow.ConversationRepository.GetRangeAsync(
                c => c.CustomerId == userId || c.ContractorId == userId,
                includeProperties: null,
                sortBy: nameof(Conversation.LastMessageAt),
                isAscending: false,
                pageNumber: 1, pageSize: 100
            );
            return _mapper.Map<List<ConversationDto>>(list);
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid conversationId, int page = 1, int pageSize = 50)
        {
            var conv = await _uow.ConversationRepository.GetAsync(c => c.ConversationId == conversationId);
            if (conv == null)
                throw new CustomValidationException(new Dictionary<string, string[]>
                {
                    ["ConversationId"] = new[] { "CONVERSATION_NOT_FOUND" }
                });

            var items = await _uow.ChatMessageRepository.GetRangeAsync(
                m => m.ConversationId == conversationId,
                sortBy: nameof(ChatMessage.SentAt),
                isAscending: true,
                pageNumber: page, pageSize: pageSize
            );

            return _mapper.Map<List<ChatMessageDto>>(items);
        }

        public async Task<ChatMessageDto> SendMessageAsync(string senderId, SendMessageRequestDto dto)
        {
            var conv = await _uow.ConversationRepository.GetAsync(c => c.ConversationId == dto.ConversationId);
            if (conv == null)
                throw new CustomValidationException(new Dictionary<string, string[]>
                {
                    ["ConversationId"] = new[] { "CONVERSATION_NOT_FOUND" }
                });

            // Map DTO -> ChatMessage, truyền thêm SenderId qua Items
            var msg = _mapper.Map<ChatMessage>(dto, opts =>
            {
                opts.Items["SenderId"] = senderId;
            });

            await _uow.ChatMessageRepository.AddAsync(msg);
            conv.LastMessageAt = msg.SentAt;
            await _uow.SaveAsync();

            return _mapper.Map<ChatMessageDto>(msg);
        }

        public async Task MarkAsReadAsync(Guid conversationId, string userId)
        {
            var msgs = await _uow.ChatMessageRepository.GetRangeAsync(
                m => m.ConversationId == conversationId && m.ReceiverId == userId && !m.IsRead,
                pageSize: 1000
            );
            foreach (var m in msgs) m.IsRead = true;
            await _uow.SaveAsync();
        }

        public async Task CloseConversationAsync(Guid conversationId, string userId)
        {
            var conv = await _uow.ConversationRepository.GetAsync(c => c.ConversationId == conversationId);
            if (conv == null) return;
            conv.ClosedAt = DateTime.UtcNow;
            await _uow.SaveAsync();
        }
    }
}
