namespace BusinessLogic.Services.Interfaces
{
    public interface ISignalRNotifier
    {
        Task SendToGroupAsync(string groupName, string eventName, object? payload);
        Task SendToAllAsync(string eventName, object? payload);
    }
}
