using AutoMapper;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;

namespace BusinessLogic.Services
{
    public class ChatMessageService : IChatMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ChatMessageService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public Task<ChatMessageDto> SendMessageAsync(SendMessageRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<ChatMessageDto> GetAllMessagesByConversationIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
