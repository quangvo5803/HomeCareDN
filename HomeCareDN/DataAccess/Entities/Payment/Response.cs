namespace DataAccess.Entities.Payment
{
    public record Response(
        int error,
        String message,
        object? data
    );
}
