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
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ConversationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ConversationDto> CreateConversationAsync(ConversationCreateRequestDto dto)
        {
            // 1. Check existing conversation
            var existingConversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ServiceRequestID == dto.ServiceRequestID
                && c.ContractorApplicationID == dto.ContractorApplicationID
            );

            if (existingConversation != null)
                return _mapper.Map<ConversationDto>(existingConversation);

            // 2. Create new
            var conversation = _mapper.Map<Conversation>(dto);
            await _unitOfWork.ConversationRepository.AddAsync(conversation);
            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<ConversationDto>(conversation);

            return result;
        }

        public async Task<ConversationDto?> GetConversationByIdAsync(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );
            var result = _mapper.Map<ConversationDto>(conversation);
            return result;
        }
    }
}
