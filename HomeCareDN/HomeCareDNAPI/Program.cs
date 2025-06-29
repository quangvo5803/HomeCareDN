using System.Text;
using BusinessLogic.Services;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using DataAccess.Repositories;
using DataAccess.Repositories.Interfaces;
using DataAccess.UnitOfWork;
using HomeCareDNAPI.Mapping;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Ultitity.Email;
using Ultitity.Email.Interface;

namespace HomeCareDNAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
            builder.Services.AddDbContext<AuthorizeDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("AuthorizeConnection")
                )
            );

            builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

            builder
                .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
                        ),
                    };
                });
            /// Register services for Application
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IFacadeService, FacadeService>();
            /// Register services for Authorize
            builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            builder.Services.AddScoped<IAuthorizeService, AuthorizeService>();
            builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
            builder.Services.AddSingleton<EmailSender>();
            builder.Services.AddHostedService<BackgroundEmailSender>();
            builder
                .Services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<AuthorizeDbContext>()
                .AddDefaultTokenProviders();
            /// Automapper
            builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

           

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            if (app.Environment.IsProduction())
            {
                app.UseExceptionHandler(errorApp =>
                {
                    errorApp.Run(async context =>
                    {
                        context.Response.StatusCode = 500;
                        context.Response.ContentType = "application/json";

                        var response = new
                        {
                            statusCode = 500,
                            message = "Có lỗi xảy ra trong hệ thống. Vui lòng thử lại sau.",
                        };

                        await context.Response.WriteAsJsonAsync(response);
                    });
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
