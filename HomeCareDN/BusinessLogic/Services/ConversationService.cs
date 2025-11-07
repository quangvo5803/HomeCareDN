using AutoMapper;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;

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

        public async Task<ConversationDto?> GetConversationByIDAsync(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );
            var result = _mapper.Map<ConversationDto>(conversation);
            return result;
        }
    }
}
