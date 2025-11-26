namespace BusinessLogic.DTOs.Application.DistributorApplication
{
    public class DistributorApplicationAcceptRequestDto
    {
        public Guid DistributorApplicationID { get; set; }
        public List<Guid>? AcceptedExtraItemIDs { get; set; }
    }
}
