using DataAccess.Data;
using DataAccess.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using WebApi.Repositories;

namespace DataAccess.UnitOfWork
{
    public interface IUnitOfWork
    {
        IImageRepository ImageRepository { get; }
        Task SaveAsync();
    }
}
