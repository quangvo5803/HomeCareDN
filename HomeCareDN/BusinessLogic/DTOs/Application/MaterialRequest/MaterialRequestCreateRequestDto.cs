namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestCreateRequestDto
    {
        public Guid CustomerID { get; set; }
        public Guid? FirstMaterialID { get; set; }
    }
}
