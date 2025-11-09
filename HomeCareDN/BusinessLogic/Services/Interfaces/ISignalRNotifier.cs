namespace BusinessLogic.Services.Interfaces
{
    public interface ISignalRNotifier
    {
        Task SendToApplicationGroupAsync(string groupName, string eventName, object? payload);
        Task SendToAllApplicationnAsync(string eventName, object? payload);
        Task SendToChatGroupAsync(string conversationId, string eventName, object? payload);
        Task SendToAllChatAsync(string eventName, object? payload);
    }
}
