using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessLogic.Mapping;
using BusinessLogic.Services;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.FacadeService.Dependencies;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using DataAccess.Repositories;
using DataAccess.Repositories.Interfaces;
using DataAccess.UnitOfWork;
using HomeCareDNAPI.BackgroundServices;
using HomeCareDNAPI.Hubs;
using HomeCareDNAPI.Realtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Net.payOS;
using Ultitity.Clients.Groqs;
using Ultitity.Email;
using Ultitity.Email.Interface;
using Ultitity.Exceptions;
using Ultitity.Options;

namespace HomeCareDNAPI
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder
                .Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions =>
                        sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
                )
            );

            builder.Services.AddDbContext<AuthorizeDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions =>
                        sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
                )
            );

            var key = builder.Configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                throw new InvalidOperationException("JWT:Key is missing in configuration.");
            }
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
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    };
                });
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(
                    "AllowReactApp",
                    policy =>
                    {
                        policy
                            .WithOrigins(
                                "http://localhost:5173",
                                "https://homecaredn.onrender.com",
                                "https://home-care-dn.vercel.app"
                            ) // domain React
                            .SetIsOriginAllowed(origin => true)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials(); // nếu dùng cookie/session
                    }
                );
            });

            builder.Services.AddHttpContextAccessor();

            builder
                .Services.AddSignalR()
                .AddJsonProtocol(options =>
                {
                    options.PayloadSerializerOptions.PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase;
                    options.PayloadSerializerOptions.DictionaryKeyPolicy =
                        JsonNamingPolicy.CamelCase;
                });
            ;

            builder.Services.AddScoped<ISignalRNotifier, SignalRNotifier>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            /// Register Options
            ///
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
            builder.Services.Configure<CloudinaryOptions>(
                builder.Configuration.GetSection("Cloudinary")
            );
            builder.Services.Configure<GoogleOptions>(builder.Configuration.GetSection("Google"));
            builder.Services.Configure<PayOsOptions>(builder.Configuration.GetSection("PayOS"));

            /// Register services for Application

            builder.Services.AddScoped<CoreDependencies>();
            builder.Services.AddScoped<InfraDependencies>();
            builder.Services.AddScoped<IdentityDependencies>();
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IFacadeService, FacadeService>();

            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddMemoryCache();
            builder.Services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = builder.Configuration.GetConnectionString("Redis");
                options.InstanceName = "HomeCareDN_";
            });
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddHostedService<ApplicationMonitor>();

            // LLM client
            builder.Services.AddHttpClient<IGroqClient, GroqClient>(client =>
            {
                var baseUrl =
                    builder.Configuration["Groq:BaseUrl"]
                    ?? throw new InvalidOperationException("Missing Groq:BaseUrl");
                client.BaseAddress = new Uri(baseUrl, UriKind.Absolute);
                client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
            });
            //PayOS
            builder.Services.AddSingleton(sp =>
            {
                var clientId = builder.Configuration["PayOS:ClientId"];
                var apiKey = builder.Configuration["PayOS:ApiKey"];
                var checksumKey = builder.Configuration["PayOS:ChecksumKey"];

                return new PayOS(clientId!, apiKey!, checksumKey!);
            });

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
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseMiddleware<ValidationExceptionMiddleware>();

            app.UseHttpsRedirection();
            app.UseWebSockets();

            app.UseRouting();

            app.UseCors("AllowReactApp");

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<ApplicationHub>("/hubs/application");
            app.MapHub<ChatHub>("/hubs/chat");

            app.Run();
        }
    }
}
