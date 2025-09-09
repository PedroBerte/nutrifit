using AutoMapper;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;

namespace Nutrifit.API.Mappings;

public class EntityToDtoProfile : AutoMapper.Profile
{
    public EntityToDtoProfile()
    {
        CreateMap<User, UserDto>().ReverseMap();
        CreateMap<Repository.Entities.Profile, ProfileDto>().ReverseMap();
        CreateMap<Role, RoleDto>().ReverseMap();
    }
}
