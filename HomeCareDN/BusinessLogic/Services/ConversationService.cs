using AutoMapper;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ConversationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ConversationDto> StartConversationAsync(StartConversationRequestDto dto)
        {
            // Map DTO -> Conversation
            var conv = _mapper.Map<Conversation>(dto);

            await _unitOfWork.ConversationRepository.AddAsync(conv);
            await _unitOfWork.SaveAsync();

            // Nếu có tin nhắn mở đầu, map tiếp DTO -> ChatMessage
            if (!string.IsNullOrWhiteSpace(dto.FirstMessage))
            {
                var msg = _mapper.Map<ChatMessage>(
                    dto,
                    opts =>
                    {
                        opts.Items["ConversationId"] = conv.ConversationId;
                    }
                );

                await _unitOfWork.ChatMessageRepository.AddAsync(msg);
                conv.LastMessageAt = msg.SentAt;
                await _unitOfWork.SaveAsync();
            }

            return _mapper.Map<ConversationDto>(conv);
        }

        public async Task<IEnumerable<ConversationDto>> GetMyConversationsAsync(string userId)
        {
            var list = await _unitOfWork.ConversationRepository.GetRangeAsync(
                c => c.CustomerId == userId || c.ContractorId == userId,
                includeProperties: null
            );
            return _mapper.Map<List<ConversationDto>>(list);
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(
            Guid conversationId,
            int page = 1,
            int pageSize = 50
        )
        {
            var conv = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationId == conversationId
            );
            if (conv == null)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        ["ConversationId"] = new[] { "CONVERSATION_NOT_FOUND" },
                    }
                );

            var items = await _unitOfWork.ChatMessageRepository.GetRangeAsync(m =>
                m.ConversationId == conversationId
            );

            return _mapper.Map<List<ChatMessageDto>>(items);
        }

        public async Task<ChatMessageDto> SendMessageAsync(
            string senderId,
            SendMessageRequestDto dto
        )
        {
            var conv = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationId == dto.ConversationId
            );
            if (conv == null)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        ["ConversationId"] = new[] { "CONVERSATION_NOT_FOUND" },
                    }
                );

            // Map DTO -> ChatMessage, truyền thêm SenderId qua Items
            var msg = _mapper.Map<ChatMessage>(
                dto,
                opts =>
                {
                    opts.Items["SenderId"] = senderId;
                }
            );

            await _unitOfWork.ChatMessageRepository.AddAsync(msg);
            conv.LastMessageAt = msg.SentAt;
            await _unitOfWork.SaveAsync();

            return _mapper.Map<ChatMessageDto>(msg);
        }

        public async Task MarkAsReadAsync(Guid conversationId, string userId)
        {
            var msgs = await _unitOfWork.ChatMessageRepository.GetRangeAsync(m =>
                m.ConversationId == conversationId && m.ReceiverId == userId && !m.IsRead
            );
            foreach (var m in msgs)
                m.IsRead = true;
            await _unitOfWork.SaveAsync();
        }

        public async Task CloseConversationAsync(Guid conversationId, string userId)
        {
            var conv = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationId == conversationId
            );
            if (conv == null)
                return;
            conv.ClosedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync();
        }
    }
}
