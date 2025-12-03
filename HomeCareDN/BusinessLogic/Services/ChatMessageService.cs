using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ChatMessageService : IChatMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ISignalRNotifier _signalRNotifier;
        private readonly UserManager<ApplicationUser> _userManager;

        private const string CONVERSATION = "Conversation";
        private const string MESSAGE = "Message";
        private const string USER = "User";

        private const string ERROR_CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
        private const string ERROR_PERMISSION_DENIED = "PERMISSION_DENIED";
        private const string ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE";

        public ChatMessageService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ISignalRNotifier signalRNotifier,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _signalRNotifier = signalRNotifier;
            _userManager = userManager;
        }

        public async Task<ChatMessageDto> SendMessageAsync(SendMessageRequestDto dto)
        {
            ValidateMessageContent(dto.Content);

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
            if (!IsUserInConversation(conversation, dto.SenderID))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { USER, new[] { ERROR_PERMISSION_DENIED } },
                };
                throw new CustomValidationException(errors);
            }

            var result = await CreateMessageAsync(dto, conversation);

            return result;
        }

        public async Task<ChatMessageDto> SendMessageToAdminAsync(SendMessageRequestDto dto)
        {
            ValidateMessageContent(dto.Content);

            var conversation = await CreateOrUpdateAdminConversationAsync(dto);

            if (!IsUserInConversation(conversation, dto.SenderID))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { USER, new[] { ERROR_PERMISSION_DENIED } },
                };
                throw new CustomValidationException(errors);
            }

            var result = await CreateMessageAsync(dto, conversation);
            return result;
        }

        public async Task<ChatMessageDto> SendMessageToUserAsync(SendMessageRequestDto dto)
        {
            ValidateMessageContent(dto.Content);

            var conversation = await CreateOrUpdateUserConversationAsync(dto);

            if (!IsUserInConversation(conversation, dto.SenderID))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { USER, new[] { ERROR_PERMISSION_DENIED } },
                };
                throw new CustomValidationException(errors);
            }

            var result = await CreateMessageAsync(dto, conversation);
            return result;
        }

        public async Task<PagedResultDto<ChatMessageDto>> GetAllMessagesByConversationIDAsync(
            ChatMessageGetByIdDto dto
        )
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(
                c => c.ConversationID == dto.ConversationID,
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

            var query = _unitOfWork
                .ChatMessageRepository.GetQueryable()
                .Where(m => m.ConversationID == dto.ConversationID)
                .OrderByDescending(m => m.SentAt);

            var total = await query.CountAsync();

            var items = await query
                .Skip((dto.MessageNumber - 1) * dto.MessageSize)
                .Take(dto.MessageSize)
                .ToListAsync();

            items.Reverse(); // hiển thị tăng dần

            return new PagedResultDto<ChatMessageDto>
            {
                Items = _mapper.Map<IEnumerable<ChatMessageDto>>(items),
                TotalCount = total,
                PageNumber = dto.MessageNumber,
                PageSize = dto.MessageSize,
            };
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
        private async Task<ChatMessageDto> CreateMessageAsync(
            SendMessageRequestDto dto,
            Conversation conversation
        )
        {
            var message = new ChatMessage
            {
                ChatMessageID = Guid.NewGuid(),
                ConversationID = dto.ConversationID,
                SenderID = dto.SenderID,
                ReceiverID = dto.ReceiverID,
                Content = dto.Content,
                SentAt = DateTime.UtcNow,
            };

            await _unitOfWork.ChatMessageRepository.AddAsync(message);
            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<ChatMessageDto>(message);

            await _signalRNotifier.SendToChatGroupAsync(
                dto.ConversationID!.Value.ToString(),
                "Chat.MessageCreated",
                result
            );

            if (conversation.ConversationType == ConversationType.AdminSupport)
            {
                await HandleAdminSupportNotifications(conversation, result, dto);
            }

            return result;
        }

        private async Task HandleAdminSupportNotifications(
            Conversation conversation,
            ChatMessageDto messageDto,
            SendMessageRequestDto dto
        )
        {
            var messageCount = await _unitOfWork
                .ChatMessageRepository.GetQueryable()
                .CountAsync(m => m.ConversationID == conversation.ConversationID);

            var isFirstMessage = messageCount == 1;
            var isAdminSender = dto.SenderID == conversation.AdminID;

            if (isFirstMessage)
            {
                // First message in conversation
                var conversationDto = _mapper.Map<ConversationDto>(conversation);
                await IncludeUserInfo(conversationDto);
                //Admin Send
                if (isAdminSender && (conversation.UserID != null))
                {
                    await _signalRNotifier.SendToUserAsync(
                        conversation.UserID,
                        "Chat.NewConversationFromAdmin",
                        new
                        {
                            conversation.ConversationID,
                            Conversation = conversationDto,
                            FirstMessage = messageDto,
                        }
                    );
                }
                //User Send
                else if (conversation.AdminID != null)
                {
                    await _signalRNotifier.SendToAdminAsync(
                        conversation.AdminID,
                        "Chat.NewConversationForAdmin",
                        new
                        {
                            conversation.ConversationID,
                            Conversation = conversationDto,
                            FirstMessage = messageDto,
                        }
                    );
                }
            }
            else
            {
                //Admin Send
                if (isAdminSender && (conversation.UserID != null))
                {
                    await _signalRNotifier.SendToUserAsync(
                        conversation.UserID,
                        "Chat.NewMessageFromAdmin",
                        new { dto.ConversationID, Message = messageDto }
                    );
                }
                //User Send
                else if (conversation.AdminID != null)
                {
                    await _signalRNotifier.SendToAdminAsync(
                        conversation.AdminID,
                        "Chat.NewAdminMessage",
                        new
                        {
                            dto.ConversationID,
                            Message = messageDto,
                            conversation.IsAdminRead,
                        }
                    );
                }
            }
        }

        private async Task IncludeUserInfo(ConversationDto conversationDto)
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

        private async Task<Conversation> CreateOrUpdateAdminConversationAsync(
            SendMessageRequestDto dto
        )
        {
            //Create
            if (dto.ConversationID == null)
            {
                var conversation = new Conversation
                {
                    ConversationID = Guid.NewGuid(),
                    UserID = dto.SenderID,
                    AdminID = dto.ReceiverID,
                    ConversationType = ConversationType.AdminSupport,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.ConversationRepository.AddAsync(conversation);
                dto.ConversationID = conversation.ConversationID;
                return conversation;
            }
            else
            {
                //Update
                var conversation = await _unitOfWork.ConversationRepository.GetAsync(
                    c => c.ConversationID == dto.ConversationID,
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

                conversation.IsAdminRead = false;

                return conversation;
            }
        }

        private async Task<Conversation> CreateOrUpdateUserConversationAsync(
            SendMessageRequestDto dto
        )
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.UserID == dto.ReceiverID
                && c.ConversationType == ConversationType.AdminSupport
                && c.AdminID == dto.SenderID
            );

            //Update
            if (conversation != null)
            {
                dto.ConversationID = conversation.ConversationID;
                conversation.IsAdminRead = true;
                return conversation;
            }

            if (dto.ConversationID != null)
            {
                conversation = await _unitOfWork.ConversationRepository.GetAsync(
                    c => c.ConversationID == dto.ConversationID,
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

                conversation.IsAdminRead = true;
                return conversation;
            }

            //Create
            conversation = new Conversation
            {
                ConversationID = Guid.NewGuid(),
                UserID = dto.ReceiverID,
                AdminID = dto.SenderID,
                ConversationType = ConversationType.AdminSupport,
                CreatedAt = DateTime.UtcNow,
                IsAdminRead = true,
            };

            await _unitOfWork.ConversationRepository.AddAsync(conversation);
            dto.ConversationID = conversation.ConversationID;

            return conversation;
        }

        private static void ValidateMessageContent(string? content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                var error = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(error);
            }
        }

        private static bool IsUserInConversation(Conversation conversation, string senderId)
        {
            if (conversation.ConversationType == ConversationType.ServiceRequest)
            {
                return conversation.CustomerID == senderId || conversation.ContractorID == senderId;
            }
            else if (conversation.ConversationType == ConversationType.MaterialRequest)
            {
                return conversation.CustomerID == senderId
                    || conversation.DistributorID == senderId;
            }
            else if (conversation.ConversationType == ConversationType.AdminSupport)
            {
                return conversation.UserID == senderId || conversation.AdminID == senderId;
            }
            else
            {
                var errors = new Dictionary<string, string[]>
                {
                    { USER, new[] { ERROR_PERMISSION_DENIED } },
                };
                throw new CustomValidationException(errors);
            }
        }
    }
}
