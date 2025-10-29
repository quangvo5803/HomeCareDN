using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;

namespace BusinessLogic.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DocumentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //public async Task DeleteDocumentAsync(string documentUrl)
        //{
        //    var document = await _unitOfWork.DocumentRepository.GetAsync(doc =>
        //        doc.DocumentUrl == documentUrl
        //    );

        //    if (document != null)
        //    {
        //        await _unitOfWork.DocumentRepository.DeleteDocumentAsync(document.PublicId);
        //        await _unitOfWork.SaveAsync();
        //    }
        //}
    }
}
