using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Services.Mappings;
using Nutrifit.Services.Services;
using Nutrifit.Services.Services.Interfaces;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connString = builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration["ConnectionStrings:Default"];

builder.Services.AddDbContext<NutrifitContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        b => b.MigrationsAssembly("Nutrifit.Repository")));

var redisConn = builder.Configuration.GetConnectionString("Redis");
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(redisConn));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IMailService, MailService>();
builder.Services.AddScoped<IProfessionalService, ProfessionalService>();

builder.Services.AddAutoMapper(cfg =>
{

}, typeof(EntityToDtoProfile).Assembly);

builder.Services.AddCors(o =>
{
    o.AddPolicy("front", p => p
        .WithOrigins("http://localhost:5173", "https://localhost:5173")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
    );
});

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(o =>
//    {
//        var cfg = builder.Configuration.GetSection("Jwt");
//        o.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = cfg["Issuer"],
//            ValidAudience = cfg["Audience"],
//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(cfg["Key"]!))
//        };
//    });


var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseCors("front"); 
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
